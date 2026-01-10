import { onMount, onCleanup, createEffect } from 'solid-js';
import * as d3 from 'd3';
import type { Trade } from '../../data/types';
import { showTooltip, hideTooltip } from './chart-tooltip';

type Props = {
  trades: Trade[];
  onMonthClick?: (month: string | null) => void;
  selectedMonth?: string | null;
};

type MonthData = {
  month: Date;
  monthKey: string;
  buys: number;
  sells: number;
  total: number;
};

function groupTradesByMonth(trades: Trade[]): MonthData[] {
  const grouped = new Map<string, { buys: number; sells: number }>();

  for (const trade of trades) {
    const date = new Date(trade.tradedAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!grouped.has(key)) {
      grouped.set(key, { buys: 0, sells: 0 });
    }

    const entry = grouped.get(key)!;
    if (trade.type === 'buy') {
      entry.buys++;
    } else {
      entry.sells++;
    }
  }

  return Array.from(grouped.entries())
    .map(([key, value]) => ({
      month: new Date(key + '-01'),
      monthKey: key,
      buys: value.buys,
      sells: value.sells,
      total: value.buys + value.sells,
    }))
    .sort((a, b) => a.month.getTime() - b.month.getTime());
}

export function TradingActivityChart(props: Props) {
  let containerRef: HTMLDivElement | undefined;
  let resizeObserver: ResizeObserver | undefined;

  const render = () => {
    if (!containerRef) return;

    const data = groupTradesByMonth(props.trades);
    if (data.length === 0) return;

    d3.select(containerRef).selectAll('*').remove();

    const rect = containerRef.getBoundingClientRect();
    const margin = { top: 20, right: 90, bottom: 30, left: 40 };
    const width = rect.width - margin.left - margin.right;
    const height = rect.height - margin.top - margin.bottom;

    if (width <= 0 || height <= 0) return;

    const svg = d3
      .select(containerRef)
      .append('svg')
      .attr('width', rect.width)
      .attr('height', rect.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.month) as [Date, Date])
      .range([0, width]);

    const maxY = d3.max(data, (d) => Math.max(d.buys, d.sells)) || 0;
    const y = d3.scaleLinear().domain([0, maxY * 1.1]).nice().range([height, 0]);

    // Grid lines
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(() => ''));

    // X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .attr('class', 'axis')
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%b %y') as any));

    // Y axis
    svg.append('g').attr('class', 'axis').call(d3.axisLeft(y).ticks(5));

    // Area fills
    const buyArea = d3
      .area<MonthData>()
      .x((d) => x(d.month))
      .y0(height)
      .y1((d) => y(d.buys))
      .curve(d3.curveMonotoneX);

    const sellArea = d3
      .area<MonthData>()
      .x((d) => x(d.month))
      .y0(height)
      .y1((d) => y(d.sells))
      .curve(d3.curveMonotoneX);

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'var(--color-buy)')
      .attr('fill-opacity', 0.1)
      .attr('d', buyArea);

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'var(--color-sell)')
      .attr('fill-opacity', 0.1)
      .attr('d', sellArea);

    // Buy line
    const buyLine = d3
      .line<MonthData>()
      .x((d) => x(d.month))
      .y((d) => y(d.buys))
      .curve(d3.curveMonotoneX);

    const buyPath = svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'var(--color-buy)')
      .attr('stroke-width', 2.5)
      .attr('d', buyLine);

    // Animate line
    const buyLength = buyPath.node()?.getTotalLength() || 0;
    buyPath
      .attr('stroke-dasharray', `${buyLength} ${buyLength}`)
      .attr('stroke-dashoffset', buyLength)
      .transition()
      .duration(1000)
      .ease(d3.easeQuadOut)
      .attr('stroke-dashoffset', 0);

    // Sell line
    const sellLine = d3
      .line<MonthData>()
      .x((d) => x(d.month))
      .y((d) => y(d.sells))
      .curve(d3.curveMonotoneX);

    const sellPath = svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'var(--color-sell)')
      .attr('stroke-width', 2.5)
      .attr('d', sellLine);

    const sellLength = sellPath.node()?.getTotalLength() || 0;
    sellPath
      .attr('stroke-dasharray', `${sellLength} ${sellLength}`)
      .attr('stroke-dashoffset', sellLength)
      .transition()
      .duration(1000)
      .ease(d3.easeQuadOut)
      .attr('stroke-dashoffset', 0);

    // Interactive dots for buys
    svg
      .selectAll('.dot-buy')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot-buy')
      .attr('cx', (d) => x(d.month))
      .attr('cy', (d) => y(d.buys))
      .attr('r', (d) => (props.selectedMonth === d.monthKey ? 8 : 5))
      .attr('fill', (d) => (props.selectedMonth === d.monthKey ? 'var(--color-buy)' : 'var(--bg-card)'))
      .attr('stroke', 'var(--color-buy)')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this).transition().duration(150).attr('r', 8);
        const containerRect = containerRef!.getBoundingClientRect();
        showTooltip({
          x: event.clientX - containerRect.left,
          y: event.clientY - containerRect.top,
          content: (
            <div class="tooltip-content">
              <div class="tooltip-title">{d3.timeFormat('%B %Y')(d.month)}</div>
              <div class="tooltip-row buy"><span class="dot" /> {d.buys} buys</div>
              <div class="tooltip-row sell"><span class="dot" /> {d.sells} sells</div>
              <div class="tooltip-row total">{d.total} total trades</div>
            </div>
          ),
        });
      })
      .on('mouseleave', function (_, d) {
        d3.select(this).transition().duration(150).attr('r', props.selectedMonth === d.monthKey ? 8 : 5);
        hideTooltip();
      })
      .on('click', (_, d) => {
        props.onMonthClick?.(props.selectedMonth === d.monthKey ? null : d.monthKey);
      });

    // Interactive dots for sells
    svg
      .selectAll('.dot-sell')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot-sell')
      .attr('cx', (d) => x(d.month))
      .attr('cy', (d) => y(d.sells))
      .attr('r', (d) => (props.selectedMonth === d.monthKey ? 8 : 5))
      .attr('fill', (d) => (props.selectedMonth === d.monthKey ? 'var(--color-sell)' : 'var(--bg-card)'))
      .attr('stroke', 'var(--color-sell)')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this).transition().duration(150).attr('r', 8);
        const containerRect = containerRef!.getBoundingClientRect();
        showTooltip({
          x: event.clientX - containerRect.left,
          y: event.clientY - containerRect.top,
          content: (
            <div class="tooltip-content">
              <div class="tooltip-title">{d3.timeFormat('%B %Y')(d.month)}</div>
              <div class="tooltip-row buy"><span class="dot" /> {d.buys} buys</div>
              <div class="tooltip-row sell"><span class="dot" /> {d.sells} sells</div>
              <div class="tooltip-row total">{d.total} total trades</div>
            </div>
          ),
        });
      })
      .on('mouseleave', function (_, d) {
        d3.select(this).transition().duration(150).attr('r', props.selectedMonth === d.monthKey ? 8 : 5);
        hideTooltip();
      })
      .on('click', (_, d) => {
        props.onMonthClick?.(props.selectedMonth === d.monthKey ? null : d.monthKey);
      });

    // Legend
    const legend = svg.append('g').attr('transform', `translate(${width + 10}, 0)`);

    legend.append('line').attr('x1', 0).attr('x2', 20).attr('y1', 0).attr('y2', 0).attr('stroke', 'var(--color-buy)').attr('stroke-width', 2.5);
    legend.append('text').attr('x', 25).attr('y', 4).attr('fill', 'var(--text-secondary)').attr('font-size', '11px').text('Buys');

    legend.append('line').attr('x1', 0).attr('x2', 20).attr('y1', 18).attr('y2', 18).attr('stroke', 'var(--color-sell)').attr('stroke-width', 2.5);
    legend.append('text').attr('x', 25).attr('y', 22).attr('fill', 'var(--text-secondary)').attr('font-size', '11px').text('Sells');
  };

  onMount(() => {
    render();
    resizeObserver = new ResizeObserver(() => render());
    if (containerRef) resizeObserver.observe(containerRef);
  });

  createEffect(() => {
    props.trades;
    props.selectedMonth;
    render();
  });

  onCleanup(() => {
    resizeObserver?.disconnect();
    hideTooltip();
  });

  return (
    <div class="chart-card">
      <h3 class="chart-title">Trading Activity Over Time</h3>
      <div ref={containerRef} class="chart-container" />
    </div>
  );
}
