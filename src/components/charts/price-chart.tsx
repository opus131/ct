import { onMount, onCleanup, createEffect } from 'solid-js';
import * as d3 from 'd3';
import { showTooltip, hideTooltip } from './chart-tooltip';

type Props = {
  prices: [string, number][];
  title?: string;
};

export function PriceChart(props: Props) {
  let containerRef: HTMLDivElement | undefined;
  let resizeObserver: ResizeObserver | undefined;

  const render = () => {
    if (!containerRef) return;

    const rawData = props.prices || [];
    if (rawData.length === 0) return;

    // Parse and sort data
    const data = rawData
      .map(([dateStr, price]) => ({
        date: new Date(dateStr),
        price,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

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

    // Scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date) as [Date, Date])
      .range([0, width]);

    const [minPrice, maxPrice] = d3.extent(data, (d) => d.price) as [number, number];
    const priceRange = maxPrice - minPrice;
    const y = d3
      .scaleLinear()
      .domain([minPrice - priceRange * 0.1, maxPrice + priceRange * 0.1])
      .nice()
      .range([height, 0]);

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
    svg
      .append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `$${d}`));

    // Determine if price went up or down
    const startPrice = data[0].price;
    const endPrice = data[data.length - 1].price;
    const isPositive = endPrice >= startPrice;
    const lineColor = isPositive ? 'var(--color-buy)' : 'var(--color-sell)';

    // Gradient fill
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
      .attr('stop-color', lineColor)
      .attr('stop-opacity', 0.3);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', lineColor)
      .attr('stop-opacity', 0);

    // Area fill
    const area = d3
      .area<{ date: Date; price: number }>()
      .x((d) => x(d.date))
      .y0(height)
      .y1((d) => y(d.price))
      .curve(d3.curveMonotoneX);

    svg
      .append('path')
      .datum(data)
      .attr('fill', `url(#${gradientId})`)
      .attr('d', area);

    // Line
    const line = d3
      .line<{ date: Date; price: number }>()
      .x((d) => x(d.date))
      .y((d) => y(d.price))
      .curve(d3.curveMonotoneX);

    const path = svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // Animate line
    const pathLength = path.node()?.getTotalLength() || 0;
    path
      .attr('stroke-dasharray', `${pathLength} ${pathLength}`)
      .attr('stroke-dashoffset', pathLength)
      .transition()
      .duration(1500)
      .ease(d3.easeQuadOut)
      .attr('stroke-dashoffset', 0);

    // Hover overlay
    const bisect = d3.bisector<{ date: Date; price: number }, Date>((d) => d.date).left;

    const hoverLine = svg
      .append('line')
      .attr('class', 'hover-line')
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', 'var(--text-muted)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0);

    const hoverDot = svg
      .append('circle')
      .attr('r', 6)
      .attr('fill', lineColor)
      .attr('stroke', 'var(--bg-card)')
      .attr('stroke-width', 2)
      .attr('opacity', 0);

    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .on('mousemove', function (event) {
        const [mouseX] = d3.pointer(event);
        const date = x.invert(mouseX);
        const index = bisect(data, date, 1);
        const d0 = data[index - 1];
        const d1 = data[index];

        if (!d0 || !d1) return;

        const d = date.getTime() - d0.date.getTime() > d1.date.getTime() - date.getTime() ? d1 : d0;

        hoverLine.attr('x1', x(d.date)).attr('x2', x(d.date)).attr('opacity', 1);
        hoverDot.attr('cx', x(d.date)).attr('cy', y(d.price)).attr('opacity', 1);

        const containerRect = containerRef!.getBoundingClientRect();
        showTooltip({
          x: event.clientX - containerRect.left,
          y: event.clientY - containerRect.top,
          content: (
            <div class="tooltip-content">
              <div class="tooltip-title">{d3.timeFormat('%B %d, %Y')(d.date)}</div>
              <div class="tooltip-row">
                <span class="price">${d.price.toFixed(2)}</span>
              </div>
            </div>
          ),
        });
      })
      .on('mouseleave', function () {
        hoverLine.attr('opacity', 0);
        hoverDot.attr('opacity', 0);
        hideTooltip();
      });

    // Current price label
    const lastPoint = data[data.length - 1];
    svg
      .append('text')
      .attr('x', width + 5)
      .attr('y', y(lastPoint.price))
      .attr('dy', '0.35em')
      .attr('fill', lineColor)
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .text(`$${lastPoint.price.toFixed(2)}`);
  };

  onMount(() => {
    render();
    resizeObserver = new ResizeObserver(() => render());
    if (containerRef) resizeObserver.observe(containerRef);
  });

  createEffect(() => {
    props.prices;
    render();
  });

  onCleanup(() => {
    resizeObserver?.disconnect();
    hideTooltip();
  });

  return (
    <div class="chart-card">
      <h3 class="chart-title">{props.title || 'Price History'}</h3>
      <div ref={containerRef} class="chart-container" />
    </div>
  );
}
