import { onMount, onCleanup, createEffect } from 'solid-js';
import * as d3 from 'd3';
import type { Trade } from '../../data/types';
import { showTooltip, hideTooltip } from './chart-tooltip';

type Props = {
  trades: Trade[];
  onSizeClick?: (size: string | null) => void;
  selectedSize?: string | null;
};

const SIZE_ORDER = ['1K-15K', '15K-50K', '50K-100K', '100K-250K', '250K-500K', '500K-1M', '1M-5M', '5M+'];

function countBySizeRange(trades: Trade[]): { range: string; count: number }[] {
  const counts = new Map<string, number>();

  for (const range of SIZE_ORDER) {
    counts.set(range, 0);
  }

  for (const trade of trades) {
    const current = counts.get(trade.sizeRange) || 0;
    counts.set(trade.sizeRange, current + 1);
  }

  return SIZE_ORDER.map((range) => ({
    range,
    count: counts.get(range) || 0,
  })).filter((d) => d.count > 0);
}

export function TradeSizeChart(props: Props) {
  let containerRef: HTMLDivElement | undefined;
  let resizeObserver: ResizeObserver | undefined;

  const render = () => {
    if (!containerRef) return;

    const data = countBySizeRange(props.trades);
    if (data.length === 0) return;

    const total = d3.sum(data, (d) => d.count);

    d3.select(containerRef).selectAll('*').remove();

    const rect = containerRef.getBoundingClientRect();
    const margin = { top: 20, right: 20, bottom: 50, left: 45 };
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
      .scaleBand()
      .domain(data.map((d) => d.range))
      .range([0, width])
      .padding(0.25);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count) || 0])
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
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-35)')
      .attr('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.5em');

    // Y axis
    svg.append('g').attr('class', 'axis').call(d3.axisLeft(y).ticks(5));

    // Color scale based on size
    const colorScale = d3
      .scaleLinear<string>()
      .domain([0, data.length - 1])
      .range(['var(--color-accent)', '#a855f7']);

    // Bars with animation
    const bars = svg
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.range)!)
      .attr('y', height)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('fill', (_, i) => colorScale(i))
      .attr('rx', 4)
      .attr('cursor', 'pointer')
      .attr('opacity', (d) => (!props.selectedSize || props.selectedSize === d.range ? 1 : 0.3));

    // Animate bars
    bars
      .transition()
      .duration(600)
      .delay((_, i) => i * 50)
      .attr('y', (d) => y(d.count))
      .attr('height', (d) => height - y(d.count));

    // Interactivity
    bars
      .on('mouseenter', function (event, d) {
        if (props.selectedSize && props.selectedSize !== d.range) return;
        d3.select(this).transition().duration(150).attr('opacity', 1).attr('transform', 'scale(1.02)');
        const containerRect = containerRef!.getBoundingClientRect();
        const pct = ((d.count / total) * 100).toFixed(1);
        showTooltip({
          x: event.clientX - containerRect.left,
          y: event.clientY - containerRect.top,
          content: (
            <div class="tooltip-content">
              <div class="tooltip-title">${d.range}</div>
              <div class="tooltip-row"><strong>{d.count}</strong> trades</div>
              <div class="tooltip-row">{pct}% of total</div>
            </div>
          ),
        });
      })
      .on('mouseleave', function (_, d) {
        const isSelected = props.selectedSize === d.range;
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', !props.selectedSize || isSelected ? 1 : 0.3)
          .attr('transform', 'scale(1)');
        hideTooltip();
      })
      .on('click', (_, d) => {
        props.onSizeClick?.(props.selectedSize === d.range ? null : d.range);
      });

    // Value labels on top of bars
    svg
      .selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', (d) => x(d.range)! + x.bandwidth() / 2)
      .attr('y', (d) => y(d.count) - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--text-secondary)')
      .attr('font-size', '10px')
      .attr('opacity', 0)
      .text((d) => d.count)
      .transition()
      .duration(600)
      .delay((_, i) => i * 50 + 300)
      .attr('opacity', 1);
  };

  onMount(() => {
    render();
    resizeObserver = new ResizeObserver(() => render());
    if (containerRef) resizeObserver.observe(containerRef);
  });

  createEffect(() => {
    props.trades;
    props.selectedSize;
    render();
  });

  onCleanup(() => {
    resizeObserver?.disconnect();
    hideTooltip();
  });

  return (
    <div class="chart-card">
      <h3 class="chart-title">Trade Size Distribution</h3>
      <div ref={containerRef} class="chart-container" />
    </div>
  );
}
