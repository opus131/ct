import { onMount, onCleanup, createEffect, createSignal, For } from 'solid-js';
import * as d3 from 'd3';
import type { Trade } from '../../data/types';
import { showTooltip, hideTooltip } from './chart-tooltip';

export type DateRange = '1M' | '3M' | '6M' | '1Y' | '3Y' | 'ALL';

type Props = {
  trades: Trade[];
  prices?: [string, number][];
  sp500Prices?: [string, number][];
  onMonthClick?: (month: string | null) => void;
  selectedMonth?: string | null;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
};

type MonthData = {
  month: Date;
  monthKey: string;
  buys: number;
  sells: number;
  total: number;
};

type PricePoint = {
  date: Date;
  price: number;
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

function parsePrices(prices: [string, number][]): PricePoint[] {
  return prices
    .map(([dateStr, price]) => ({
      date: new Date(dateStr),
      price,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

function getDateRangeStart(range: DateRange): Date {
  const now = new Date();
  switch (range) {
    case '1M':
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case '3M':
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case '6M':
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case '1Y':
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    case '3Y':
      return new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
    case 'ALL':
    default:
      return new Date(0); // Beginning of time
  }
}

function filterByDateRange<T extends { date: Date } | MonthData>(
  data: T[],
  range: DateRange
): T[] {
  if (range === 'ALL') return data;
  const startDate = getDateRangeStart(range);
  return data.filter((d) => {
    const date = 'date' in d ? d.date : d.month;
    return date >= startDate;
  });
}

const DATE_RANGES: DateRange[] = ['1M', '3M', '6M', '1Y', '3Y', 'ALL'];

export function TradingActivityChart(props: Props) {
  let containerRef: HTMLDivElement | undefined;
  let resizeObserver: ResizeObserver | undefined;
  const [internalRange, setInternalRange] = createSignal<DateRange>('ALL');

  const currentRange = () => props.dateRange ?? internalRange();
  const setRange = (range: DateRange) => {
    if (props.onDateRangeChange) {
      props.onDateRangeChange(range);
    } else {
      setInternalRange(range);
    }
  };

  const renderWithPrices = () => {
    if (!containerRef) return;

    const range = currentRange();
    const rawTradeData = groupTradesByMonth(props.trades);
    const rawPriceData = parsePrices(props.prices || []);
    const rawSP500Data = parsePrices(props.sp500Prices || []);

    // Apply date range filter
    const tradeData = filterByDateRange(rawTradeData, range);
    const priceData = filterByDateRange(rawPriceData, range);
    const sp500Data = filterByDateRange(rawSP500Data, range);

    if (tradeData.length === 0 && priceData.length === 0 && sp500Data.length === 0) return;

    d3.select(containerRef).selectAll('*').remove();

    const rect = containerRef.getBoundingClientRect();
    const margin = { top: 20, right: 60, bottom: 30, left: 50 };
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

    // Determine time domain from all datasets
    const allDates = [
      ...tradeData.map((d) => d.month),
      ...priceData.map((d) => d.date),
      ...sp500Data.map((d) => d.date),
    ];
    const timeDomain = d3.extent(allDates) as [Date, Date];

    const x = d3.scaleTime().domain(timeDomain).range([0, width]);

    // For normalized comparison, use percentage change from first value
    const normalizeData = (data: PricePoint[]): PricePoint[] => {
      if (data.length === 0) return [];
      const firstPrice = data[0].price;
      return data.map((d) => ({ date: d.date, price: ((d.price - firstPrice) / firstPrice) * 100 }));
    };

    // Normalize both price series for comparison if both exist
    const hasBothPrices = priceData.length > 0 && sp500Data.length > 0;
    const normalizedPriceData = hasBothPrices ? normalizeData(priceData) : priceData;
    const normalizedSP500Data = hasBothPrices ? normalizeData(sp500Data) : sp500Data;

    // Price scale (right axis) - use normalized if comparing, raw otherwise
    const allPrices = [...normalizedPriceData, ...normalizedSP500Data].map((d) => d.price);
    const [minPrice, maxPrice] = d3.extent(allPrices) as [number, number];
    const priceRange = maxPrice - minPrice || 1;
    const yPrice = d3
      .scaleLinear()
      .domain([minPrice - priceRange * 0.1, maxPrice + priceRange * 0.1])
      .nice()
      .range([height, 0]);

    // Trade count scale (left axis)
    const maxTrades = d3.max(tradeData, (d) => Math.max(d.buys, d.sells)) || 1;
    const yTrades = d3.scaleLinear().domain([0, maxTrades * 1.2]).nice().range([height, 0]);

    // Grid lines
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(yTrades).tickSize(-width).tickFormat(() => ''));

    // X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .attr('class', 'axis')
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%b %y') as any));

    // Left Y axis (trades)
    svg
      .append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(yTrades).ticks(5));

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -height / 2)
      .attr('fill', 'var(--text-muted)')
      .attr('font-size', '10px')
      .attr('text-anchor', 'middle')
      .text('Trades');

    // Right Y axis (price) - show % change if comparing, $ otherwise
    const hasBoth = priceData.length > 0 && sp500Data.length > 0;
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${width},0)`)
      .call(d3.axisRight(yPrice).ticks(5).tickFormat((d) => hasBoth ? `${Number(d) > 0 ? '+' : ''}${Number(d).toFixed(0)}%` : `$${d}`));

    svg
      .append('text')
      .attr('transform', 'rotate(90)')
      .attr('y', -width - 45)
      .attr('x', height / 2)
      .attr('fill', 'var(--text-muted)')
      .attr('font-size', '10px')
      .attr('text-anchor', 'middle')
      .text(hasBoth ? '% Change' : 'Price');

    // Calculate bar width based on data density
    const barWidth = Math.min(20, (width / tradeData.length) * 0.35);

    // Buy columns
    svg
      .selectAll('.bar-buy')
      .data(tradeData)
      .enter()
      .append('rect')
      .attr('class', 'bar-buy')
      .attr('x', (d) => x(d.month) - barWidth - 1)
      .attr('y', height)
      .attr('width', barWidth)
      .attr('height', 0)
      .attr('fill', 'var(--color-buy)')
      .attr('opacity', 0.8)
      .attr('rx', 2)
      .attr('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('opacity', 1);
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
      .on('mouseleave', function () {
        d3.select(this).attr('opacity', 0.8);
        hideTooltip();
      })
      .on('click', (_, d) => {
        props.onMonthClick?.(props.selectedMonth === d.monthKey ? null : d.monthKey);
      })
      .transition()
      .duration(600)
      .delay((_, i) => i * 30)
      .attr('y', (d) => yTrades(d.buys))
      .attr('height', (d) => height - yTrades(d.buys));

    // Sell columns
    svg
      .selectAll('.bar-sell')
      .data(tradeData)
      .enter()
      .append('rect')
      .attr('class', 'bar-sell')
      .attr('x', (d) => x(d.month) + 1)
      .attr('y', height)
      .attr('width', barWidth)
      .attr('height', 0)
      .attr('fill', 'var(--color-sell)')
      .attr('opacity', 0.8)
      .attr('rx', 2)
      .attr('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('opacity', 1);
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
      .on('mouseleave', function () {
        d3.select(this).attr('opacity', 0.8);
        hideTooltip();
      })
      .on('click', (_, d) => {
        props.onMonthClick?.(props.selectedMonth === d.monthKey ? null : d.monthKey);
      })
      .transition()
      .duration(600)
      .delay((_, i) => i * 30)
      .attr('y', (d) => yTrades(d.sells))
      .attr('height', (d) => height - yTrades(d.sells));

    // S&P 500 line (gray, dashed, rendered first so it's behind)
    if (normalizedSP500Data.length > 0) {
      const sp500Line = d3
        .line<PricePoint>()
        .x((d) => x(d.date))
        .y((d) => yPrice(d.price))
        .curve(d3.curveMonotoneX);

      const sp500Path = svg
        .append('path')
        .datum(normalizedSP500Data)
        .attr('fill', 'none')
        .attr('stroke', 'var(--text-muted)')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.6)
        .attr('d', sp500Line);

      // Animate S&P 500 line
      const sp500PathLength = sp500Path.node()?.getTotalLength() || 0;
      sp500Path
        .attr('stroke-dasharray', `${sp500PathLength} ${sp500PathLength}`)
        .attr('stroke-dashoffset', sp500PathLength)
        .transition()
        .duration(1200)
        .ease(d3.easeQuadOut)
        .attr('stroke-dashoffset', 0)
        .on('end', function() {
          d3.select(this).attr('stroke-dasharray', '4,4');
        });
    }

    // Price gradient (issuer price)
    if (normalizedPriceData.length > 0) {
      const gradientId = `price-gradient-${Math.random().toString(36).substr(2, 9)}`;
      const gradient = svg
        .append('defs')
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', 'var(--color-accent)')
        .attr('stop-opacity', 0.3);

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', 'var(--color-accent)')
        .attr('stop-opacity', 0);

      // Price area fill
      const priceArea = d3
        .area<PricePoint>()
        .x((d) => x(d.date))
        .y0(height)
        .y1((d) => yPrice(d.price))
        .curve(d3.curveMonotoneX);

      svg
        .append('path')
        .datum(normalizedPriceData)
        .attr('fill', `url(#${gradientId})`)
        .attr('d', priceArea);

      // Price line (issuer)
      const priceLine = d3
        .line<PricePoint>()
        .x((d) => x(d.date))
        .y((d) => yPrice(d.price))
        .curve(d3.curveMonotoneX);

      const path = svg
        .append('path')
        .datum(normalizedPriceData)
        .attr('fill', 'none')
        .attr('stroke', 'var(--color-accent)')
        .attr('stroke-width', 2.5)
        .attr('d', priceLine);

      // Animate price line
      const pathLength = path.node()?.getTotalLength() || 0;
      path
        .attr('stroke-dasharray', `${pathLength} ${pathLength}`)
        .attr('stroke-dashoffset', pathLength)
        .transition()
        .duration(1500)
        .ease(d3.easeQuadOut)
        .attr('stroke-dashoffset', 0);
    }

    // Legend for price lines
    if (hasBoth) {
      const legendY = height + 25;
      svg.append('line')
        .attr('x1', width - 150)
        .attr('x2', width - 130)
        .attr('y1', legendY)
        .attr('y2', legendY)
        .attr('stroke', 'var(--color-accent)')
        .attr('stroke-width', 2.5);
      svg.append('text')
        .attr('x', width - 125)
        .attr('y', legendY + 4)
        .attr('fill', 'var(--text-muted)')
        .attr('font-size', '9px')
        .text('Stock');

      svg.append('line')
        .attr('x1', width - 70)
        .attr('x2', width - 50)
        .attr('y1', legendY)
        .attr('y2', legendY)
        .attr('stroke', 'var(--text-muted)')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4');
      svg.append('text')
        .attr('x', width - 45)
        .attr('y', legendY + 4)
        .attr('fill', 'var(--text-muted)')
        .attr('font-size', '9px')
        .text('S&P 500');
    }
  };

  const renderDefault = () => {
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

  const render = () => {
    const hasPrices = (props.prices && props.prices.length > 0) || (props.sp500Prices && props.sp500Prices.length > 0);
    if (hasPrices) {
      renderWithPrices();
    } else {
      renderDefault();
    }
  };

  onMount(() => {
    render();
    resizeObserver = new ResizeObserver(() => render());
    if (containerRef) resizeObserver.observe(containerRef);
  });

  createEffect(() => {
    props.trades;
    props.prices;
    props.sp500Prices;
    props.selectedMonth;
    currentRange();
    render();
  });

  onCleanup(() => {
    resizeObserver?.disconnect();
    hideTooltip();
  });

  const hasPriceData = () => (props.prices && props.prices.length > 0) || (props.sp500Prices && props.sp500Prices.length > 0);

  return (
    <div class="chart-card">
      <div class="chart-header">
        <h3 class="chart-title">
          {props.prices && props.prices.length > 0 ? 'Price & Trading Activity' : 'Trading Activity Over Time'}
        </h3>
        {hasPriceData() && (
          <div class="date-range-selector">
            <For each={DATE_RANGES}>
              {(range) => (
                <button
                  class={`range-btn ${currentRange() === range ? 'active' : ''}`}
                  onClick={() => setRange(range)}
                >
                  {range}
                </button>
              )}
            </For>
          </div>
        )}
      </div>
      <div ref={containerRef} class="chart-container" />
    </div>
  );
}
