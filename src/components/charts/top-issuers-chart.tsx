import { onMount, onCleanup, createEffect } from 'solid-js';
import * as d3 from 'd3';
import type { Trade } from '../../data/types';
import { showTooltip, hideTooltip } from './chart-tooltip';

type Props = {
  trades: Trade[];
  onIssuerClick?: (issuerId: string | null) => void;
  selectedIssuer?: string | null;
};

type IssuerCount = {
  id: string;
  name: string;
  ticker: string;
  count: number;
  buys: number;
  sells: number;
};

function countByIssuer(trades: Trade[]): IssuerCount[] {
  const counts = new Map<string, IssuerCount>();

  for (const trade of trades) {
    const key = trade.issuer.id;
    if (!counts.has(key)) {
      counts.set(key, {
        id: trade.issuer.id,
        name: trade.issuer.name,
        ticker: trade.issuer.ticker,
        count: 0,
        buys: 0,
        sells: 0,
      });
    }
    const entry = counts.get(key)!;
    entry.count++;
    if (trade.type === 'buy') entry.buys++;
    else entry.sells++;
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function TopIssuersChart(props: Props) {
  let containerRef: HTMLDivElement | undefined;
  let resizeObserver: ResizeObserver | undefined;

  const render = () => {
    if (!containerRef) return;

    const data = countByIssuer(props.trades);
    if (data.length === 0) return;

    d3.select(containerRef).selectAll('*').remove();

    const rect = containerRef.getBoundingClientRect();
    const margin = { top: 10, right: 50, bottom: 10, left: 80 };
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

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.ticker))
      .range([0, height])
      .padding(0.3);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count) || 0])
      .nice()
      .range([0, width]);

    // Y axis (issuer tickers)
    svg
      .append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(y).tickSize(0))
      .select('.domain')
      .remove();

    svg.selectAll('.axis text').attr('fill', 'var(--text-secondary)').attr('font-size', '11px');

    // Stacked bars (buys + sells)
    const barGroups = svg
      .selectAll('.bar-group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('transform', (d) => `translate(0,${y(d.ticker)})`)
      .attr('cursor', 'pointer')
      .attr('opacity', (d) => (!props.selectedIssuer || props.selectedIssuer === d.id ? 1 : 0.3));

    // Buy portion
    barGroups
      .append('rect')
      .attr('class', 'bar-buy')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 0)
      .attr('height', y.bandwidth())
      .attr('fill', 'var(--color-buy)')
      .attr('rx', 4)
      .transition()
      .duration(600)
      .delay((_, i) => i * 40)
      .attr('width', (d) => x(d.buys));

    // Sell portion
    barGroups
      .append('rect')
      .attr('class', 'bar-sell')
      .attr('x', (d) => x(d.buys))
      .attr('y', 0)
      .attr('width', 0)
      .attr('height', y.bandwidth())
      .attr('fill', 'var(--color-sell)')
      .attr('rx', 0)
      .transition()
      .duration(600)
      .delay((_, i) => i * 40 + 200)
      .attr('width', (d) => x(d.sells));

    // Interactivity on group
    barGroups
      .on('mouseenter', function (event, d) {
        if (props.selectedIssuer && props.selectedIssuer !== d.id) return;
        d3.select(this).transition().duration(150).attr('opacity', 1);
        d3.select(this).selectAll('rect').transition().duration(150).attr('transform', 'scaleX(1.02)');

        const containerRect = containerRef!.getBoundingClientRect();
        showTooltip({
          x: event.clientX - containerRect.left,
          y: event.clientY - containerRect.top,
          content: (
            <div class="tooltip-content">
              <div class="tooltip-title">{d.name}</div>
              <div class="tooltip-subtitle">{d.ticker}</div>
              <div class="tooltip-row buy"><span class="dot" /> {d.buys} buys</div>
              <div class="tooltip-row sell"><span class="dot" /> {d.sells} sells</div>
              <div class="tooltip-row total"><strong>{d.count}</strong> total trades</div>
            </div>
          ),
        });
      })
      .on('mouseleave', function (_, d) {
        const isSelected = props.selectedIssuer === d.id;
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', !props.selectedIssuer || isSelected ? 1 : 0.3);
        d3.select(this).selectAll('rect').transition().duration(150).attr('transform', 'scaleX(1)');
        hideTooltip();
      })
      .on('click', (_, d) => {
        props.onIssuerClick?.(props.selectedIssuer === d.id ? null : d.id);
      });

    // Count labels
    svg
      .selectAll('.count-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'count-label')
      .attr('x', (d) => x(d.count) + 8)
      .attr('y', (d) => y(d.ticker)! + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('fill', 'var(--text-secondary)')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('opacity', 0)
      .text((d) => d.count)
      .transition()
      .duration(400)
      .delay((_, i) => i * 40 + 400)
      .attr('opacity', 1);
  };

  onMount(() => {
    render();
    resizeObserver = new ResizeObserver(() => render());
    if (containerRef) resizeObserver.observe(containerRef);
  });

  createEffect(() => {
    props.trades;
    props.selectedIssuer;
    render();
  });

  onCleanup(() => {
    resizeObserver?.disconnect();
    hideTooltip();
  });

  return (
    <div class="chart-card">
      <h3 class="chart-title">Top Traded Issuers</h3>
      <div ref={containerRef} class="chart-container" />
    </div>
  );
}
