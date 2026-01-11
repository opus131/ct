import { onMount, onCleanup, createEffect } from 'solid-js';
import * as d3 from 'd3';
import type { Trade } from '../../data/types';
import { showTooltip, hideTooltip } from './chart-tooltip';

type Props = {
  trades: Trade[];
  onPoliticianClick?: (politicianId: string | null) => void;
  selectedPolitician?: string | null;
};

type PoliticianCount = {
  id: string;
  name: string;
  party: string;
  count: number;
  buys: number;
  sells: number;
};

function countByPolitician(trades: Trade[]): PoliticianCount[] {
  const counts = new Map<string, PoliticianCount>();

  for (const trade of trades) {
    const key = trade.politician.id;
    if (!counts.has(key)) {
      counts.set(key, {
        id: trade.politician.id,
        name: trade.politician.name,
        party: trade.politician.party,
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

function truncateName(name: string, maxLen: number): string {
  if (name.length <= maxLen) return name;
  return name.substring(0, maxLen - 1) + '…';
}

export function TopPoliticiansChart(props: Props) {
  let containerRef: HTMLDivElement | undefined;
  let resizeObserver: ResizeObserver | undefined;

  const render = () => {
    if (!containerRef) return;

    const data = countByPolitician(props.trades);
    if (data.length === 0) return;

    d3.select(containerRef).selectAll('*').remove();

    const rect = containerRef.getBoundingClientRect();
    const margin = { top: 10, right: 50, bottom: 10, left: 100 };
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
      .domain(data.map((d) => d.id))
      .range([0, height])
      .padding(0.3);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count) || 0])
      .nice()
      .range([0, width]);

    // Y axis (politician names)
    svg
      .append('g')
      .attr('class', 'axis')
      .call(
        d3.axisLeft(y).tickSize(0).tickFormat((id) => {
          const politician = data.find((d) => d.id === id);
          return politician ? truncateName(politician.name, 14) : '';
        })
      )
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
      .attr('transform', (d) => `translate(0,${y(d.id)})`)
      .attr('cursor', 'pointer')
      .attr('opacity', (d) => (!props.selectedPolitician || props.selectedPolitician === d.id ? 1 : 0.3));

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

    // Party indicator dots
    barGroups
      .append('circle')
      .attr('cx', -8)
      .attr('cy', y.bandwidth() / 2)
      .attr('r', 4)
      .attr('fill', (d) => (d.party === 'Democrat' ? 'var(--party-democrat)' : 'var(--party-republican)'));

    // Interactivity on group
    barGroups
      .on('mouseenter', function (event, d) {
        if (props.selectedPolitician && props.selectedPolitician !== d.id) return;
        d3.select(this).transition().duration(150).attr('opacity', 1);
        d3.select(this).selectAll('rect').transition().duration(150).attr('transform', 'scaleX(1.02)');

        const containerRect = containerRef!.getBoundingClientRect();
        showTooltip({
          x: event.clientX - containerRect.left,
          y: event.clientY - containerRect.top,
          content: (
            <div class="tooltip-content">
              <div class="tooltip-title">{d.name}</div>
              <div class="tooltip-subtitle">{d.party}</div>
              <div class="tooltip-row buy"><span class="dot" /> {d.buys} buys</div>
              <div class="tooltip-row sell"><span class="dot" /> {d.sells} sells</div>
              <div class="tooltip-row total"><strong>{d.count}</strong> total trades</div>
            </div>
          ),
        });
      })
      .on('mouseleave', function (_, d) {
        const isSelected = props.selectedPolitician === d.id;
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', !props.selectedPolitician || isSelected ? 1 : 0.3);
        d3.select(this).selectAll('rect').transition().duration(150).attr('transform', 'scaleX(1)');
        hideTooltip();
      })
      .on('click', (_, d) => {
        props.onPoliticianClick?.(props.selectedPolitician === d.id ? null : d.id);
      });

    // Count labels
    svg
      .selectAll('.count-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'count-label')
      .attr('x', (d) => x(d.count) + 8)
      .attr('y', (d) => y(d.id)! + y.bandwidth() / 2)
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
    props.selectedPolitician;
    render();
  });

  onCleanup(() => {
    resizeObserver?.disconnect();
    hideTooltip();
  });

  return (
    <div class="chart-card">
      <h3 class="chart-title">Top Politicians</h3>
      <div ref={containerRef} class="chart-container" />
    </div>
  );
}
