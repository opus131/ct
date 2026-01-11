import { onMount, onCleanup, createEffect } from 'solid-js';
import * as d3 from 'd3';
import type { Trade } from '../../data/types';
import { showTooltip, hideTooltip } from './chart-tooltip';

type Props = {
  trades: Trade[];
  onSectorClick?: (sector: string | null) => void;
  selectedSector?: string | null;
};

type SectorData = {
  sector: string;
  label: string;
  count: number;
  color: string;
};

const SECTOR_COLORS: Record<string, string> = {
  'information-technology': '#6366f1',
  'health-care': '#ec4899',
  'financials': '#10b981',
  'consumer-discretionary': '#f59e0b',
  'industrials': '#6b7280',
  'communication-services': '#3b82f6',
  'energy': '#ef4444',
  'materials': '#8b5cf6',
  'utilities': '#14b8a6',
  'real-estate': '#f97316',
  'consumer-staples': '#84cc16',
  'unknown': '#4b5563',
};

const SECTOR_LABELS: Record<string, string> = {
  'information-technology': 'Technology',
  'health-care': 'Healthcare',
  'financials': 'Financials',
  'consumer-discretionary': 'Consumer Disc.',
  'industrials': 'Industrials',
  'communication-services': 'Comm. Services',
  'energy': 'Energy',
  'materials': 'Materials',
  'utilities': 'Utilities',
  'real-estate': 'Real Estate',
  'consumer-staples': 'Consumer Staples',
  'unknown': 'Unknown',
};

function countBySector(trades: Trade[]): SectorData[] {
  const counts = new Map<string, number>();

  for (const trade of trades) {
    const sector = trade.issuer.sector || 'unknown';
    counts.set(sector, (counts.get(sector) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([sector, count]) => ({
      sector,
      label: SECTOR_LABELS[sector] || sector,
      count,
      color: SECTOR_COLORS[sector] || SECTOR_COLORS['unknown'],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8 sectors
}

export function SectorBreakdownChart(props: Props) {
  let containerRef: HTMLDivElement | undefined;
  let resizeObserver: ResizeObserver | undefined;

  const render = () => {
    if (!containerRef) return;

    const data = countBySector(props.trades);
    const total = d3.sum(data, (d) => d.count);

    if (data.length === 0 || total === 0) return;

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
      .pie<SectorData>()
      .value((d) => d.count)
      .sort(null)
      .padAngle(0.02);

    const arc = d3
      .arc<d3.PieArcDatum<SectorData>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(3);

    const hoverArc = d3
      .arc<d3.PieArcDatum<SectorData>>()
      .innerRadius(innerRadius)
      .outerRadius(radius + 6)
      .cornerRadius(3);

    const arcs = svg
      .selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', (d) => {
        const isSelected = props.selectedSector === d.data.sector;
        return isSelected ? hoverArc(d) : arc(d);
      })
      .attr('fill', (d) => d.data.color)
      .attr('stroke', 'var(--bg-card)')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .attr('opacity', (d) => (!props.selectedSector || props.selectedSector === d.data.sector ? 1 : 0.3));

    // Animate on mount
    arcs
      .transition()
      .duration(800)
      .attrTween('d', function (d) {
        const isSelected = props.selectedSector === d.data.sector;
        const targetArc = isSelected ? hoverArc : arc;
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return (t) => targetArc(interpolate(t))!;
      });

    // Interactivity
    arcs
      .on('mouseenter', function (event, d) {
        if (props.selectedSector && props.selectedSector !== d.data.sector) return;
        d3.select(this).transition().duration(150).attr('d', hoverArc(d));
        const containerRect = containerRef!.getBoundingClientRect();
        const pct = ((d.data.count / total) * 100).toFixed(1);
        showTooltip({
          x: event.clientX - containerRect.left,
          y: event.clientY - containerRect.top,
          content: (
            <div class="tooltip-content">
              <div class="tooltip-title">{d.data.label}</div>
              <div class="tooltip-row"><strong>{d.data.count}</strong> trades</div>
              <div class="tooltip-row">{pct}% of total</div>
            </div>
          ),
        });
      })
      .on('mouseleave', function (_, d) {
        const isSelected = props.selectedSector === d.data.sector;
        d3.select(this).transition().duration(150).attr('d', isSelected ? hoverArc(d) : arc(d));
        hideTooltip();
      })
      .on('click', (_, d) => {
        props.onSectorClick?.(props.selectedSector === d.data.sector ? null : d.data.sector);
      });

    // Center text
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.1em')
      .attr('fill', 'var(--text-primary)')
      .attr('font-size', '24px')
      .attr('font-weight', '700')
      .text(data.length.toString());

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .attr('fill', 'var(--text-secondary)')
      .attr('font-size', '10px')
      .attr('text-transform', 'uppercase')
      .text('Sectors');

    // Legend (top 4 only to save space)
    const legendData = data.slice(0, 4);
    const legend = svg.append('g').attr('transform', `translate(${radius + 20}, ${-legendData.length * 13})`);

    legendData.forEach((d, i) => {
      const g = legend.append('g').attr('transform', `translate(0, ${i * 22})`);

      g.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('rx', 2)
        .attr('fill', d.color)
        .attr('opacity', !props.selectedSector || props.selectedSector === d.sector ? 1 : 0.3);

      g.append('text')
        .attr('x', 16)
        .attr('y', 10)
        .attr('fill', 'var(--text-secondary)')
        .attr('font-size', '10px')
        .text(d.label);
    });
  };

  onMount(() => {
    render();
    resizeObserver = new ResizeObserver(() => render());
    if (containerRef) resizeObserver.observe(containerRef);
  });

  createEffect(() => {
    props.trades;
    props.selectedSector;
    render();
  });

  onCleanup(() => {
    resizeObserver?.disconnect();
    hideTooltip();
  });

  return (
    <div class="chart-card">
      <h3 class="chart-title">Sector Breakdown</h3>
      <div ref={containerRef} class="chart-container" />
    </div>
  );
}
