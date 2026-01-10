import { onMount, onCleanup, createEffect } from 'solid-js';
import * as d3 from 'd3';
import type { Trade, TradeType } from '../../data/types';
import { showTooltip, hideTooltip } from './chart-tooltip';

type Props = {
  trades: Trade[];
  onTypeClick?: (type: TradeType | null) => void;
  selectedType?: TradeType | null;
};

function countByType(trades: Trade[]): { type: TradeType; label: string; count: number; color: string }[] {
  const buys = trades.filter((t) => t.type === 'buy').length;
  const sells = trades.filter((t) => t.type === 'sell').length;

  return [
    { type: 'buy', label: 'Buy', count: buys, color: 'var(--color-buy)' },
    { type: 'sell', label: 'Sell', count: sells, color: 'var(--color-sell)' },
  ];
}

export function TradeTypeChart(props: Props) {
  let containerRef: HTMLDivElement | undefined;
  let resizeObserver: ResizeObserver | undefined;

  const render = () => {
    if (!containerRef) return;

    const data = countByType(props.trades);
    const total = d3.sum(data, (d) => d.count);

    d3.select(containerRef).selectAll('*').remove();

    const rect = containerRef.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);
    const radius = size / 2 - 20;
    const innerRadius = radius * 0.55;

    if (size <= 0) return;

    const svg = d3
      .select(containerRef)
      .append('svg')
      .attr('width', rect.width)
      .attr('height', rect.height)
      .append('g')
      .attr('transform', `translate(${rect.width / 2},${rect.height / 2})`);

    const pie = d3
      .pie<{ type: TradeType; label: string; count: number; color: string }>()
      .value((d) => d.count)
      .sort(null)
      .padAngle(0.03);

    const arc = d3
      .arc<d3.PieArcDatum<{ type: TradeType; label: string; count: number; color: string }>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(4);

    const hoverArc = d3
      .arc<d3.PieArcDatum<{ type: TradeType; label: string; count: number; color: string }>>()
      .innerRadius(innerRadius)
      .outerRadius(radius + 8)
      .cornerRadius(4);

    const arcs = svg
      .selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', (d) => {
        const isSelected = props.selectedType === d.data.type;
        return isSelected ? hoverArc(d) : arc(d);
      })
      .attr('fill', (d) => d.data.color)
      .attr('stroke', 'var(--bg-card)')
      .attr('stroke-width', 3)
      .attr('cursor', 'pointer')
      .attr('opacity', (d) => (!props.selectedType || props.selectedType === d.data.type ? 1 : 0.4));

    // Animate on mount
    arcs
      .transition()
      .duration(800)
      .attrTween('d', function (d) {
        const isSelected = props.selectedType === d.data.type;
        const targetArc = isSelected ? hoverArc : arc;
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return (t) => targetArc(interpolate(t))!;
      });

    // Interactivity
    arcs
      .on('mouseenter', function (event, d) {
        if (props.selectedType && props.selectedType !== d.data.type) return;
        d3.select(this).transition().duration(150).attr('d', hoverArc(d));
        const containerRect = containerRef!.getBoundingClientRect();
        const pct = ((d.data.count / total) * 100).toFixed(1);
        showTooltip({
          x: event.clientX - containerRect.left,
          y: event.clientY - containerRect.top,
          content: (
            <div class="tooltip-content">
              <div class="tooltip-title">{d.data.label} Transactions</div>
              <div class="tooltip-row"><strong>{d.data.count}</strong> trades</div>
              <div class="tooltip-row">{pct}% of total</div>
            </div>
          ),
        });
      })
      .on('mouseleave', function (_, d) {
        const isSelected = props.selectedType === d.data.type;
        d3.select(this).transition().duration(150).attr('d', isSelected ? hoverArc(d) : arc(d));
        hideTooltip();
      })
      .on('click', (_, d) => {
        props.onTypeClick?.(props.selectedType === d.data.type ? null : d.data.type);
      });

    // Center text
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.1em')
      .attr('fill', 'var(--text-primary)')
      .attr('font-size', '28px')
      .attr('font-weight', '700')
      .text(total.toString());

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .attr('fill', 'var(--text-secondary)')
      .attr('font-size', '11px')
      .attr('text-transform', 'uppercase')
      .text('Total Trades');

    // Legend
    const legend = svg.append('g').attr('transform', `translate(${radius + 30}, -15)`);

    data.forEach((d, i) => {
      const g = legend.append('g').attr('transform', `translate(0, ${i * 26})`);

      g.append('rect')
        .attr('width', 14)
        .attr('height', 14)
        .attr('rx', 3)
        .attr('fill', d.color)
        .attr('opacity', !props.selectedType || props.selectedType === d.type ? 1 : 0.4);

      g.append('text')
        .attr('x', 20)
        .attr('y', 11)
        .attr('fill', 'var(--text-secondary)')
        .attr('font-size', '12px')
        .text(`${d.label}: ${d.count}`);
    });
  };

  onMount(() => {
    render();
    resizeObserver = new ResizeObserver(() => render());
    if (containerRef) resizeObserver.observe(containerRef);
  });

  createEffect(() => {
    props.trades;
    props.selectedType;
    render();
  });

  onCleanup(() => {
    resizeObserver?.disconnect();
    hideTooltip();
  });

  return (
    <div class="chart-card">
      <h3 class="chart-title">Buy vs Sell</h3>
      <div ref={containerRef} class="chart-container" />
    </div>
  );
}
