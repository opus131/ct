import './style.css';

import { A, useParams } from '@solidjs/router';
import { Show, For, createSignal, createMemo } from 'solid-js';

import { StatsRow } from '../../components/stats-row';
import { TradesTable } from '../../components/trades-table';
import { PoliticianCard } from '../../components/politician-card';
import {
  TradingActivityChart,
  TradeTypeChart,
  SectorBreakdownChart,
  TopIssuersChart,
  ChartTooltip,
} from '../../components/charts';
import { getStateById } from '../../data/states';
import { getPoliticians, getTrades } from '../../data/data-service';
import type { TradeType } from '../../data/types';

type FilterState = {
  month?: string | null;
  type?: TradeType | null;
  sector?: string | null;
  issuer?: string | null;
};

function formatSenateComposition(composition: string): { label: string; d: number; r: number; i: number } {
  const parts = composition.split('_');
  let d = 0, r = 0, i = 0;

  for (const p of parts) {
    if (p === 'd') d++;
    else if (p === 'r') r++;
    else if (p === 'i' || p === 'id') i++;
  }

  const labels: string[] = [];
  if (d > 0) labels.push(`${d}D`);
  if (r > 0) labels.push(`${r}R`);
  if (i > 0) labels.push(`${i}I`);

  return { label: labels.join(' / '), d, r, i };
}

export function StateDetail() {
  const params = useParams<{ id: string }>();
  const state = () => getStateById(params.id);

  const [filter, setFilter] = createSignal<FilterState>({});

  const statePoliticians = createMemo(() => {
    const s = state();
    if (!s) return [];

    const stateCode = s.id.toUpperCase();
    return getPoliticians()
      .filter((p) => p.state === stateCode)
      .sort((a, b) => b.trades - a.trades);
  });

  const allStateTrades = createMemo(() => {
    const s = state();
    if (!s) return [];

    const stateCode = s.id.toUpperCase();
    return getTrades().filter((t) => t.politician.state === stateCode);
  });

  const issuerFilteredTrades = createMemo(() => {
    const f = filter();
    if (!f.issuer) return allStateTrades();
    return allStateTrades().filter((t) => t.issuer.id === f.issuer);
  });

  const filteredTrades = createMemo(() => {
    let trades = allStateTrades();
    const f = filter();

    if (f.month) {
      trades = trades.filter((t) => {
        const date = new Date(t.tradedAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return key === f.month;
      });
    }

    if (f.type) {
      trades = trades.filter((t) => t.type === f.type);
    }

    if (f.sector) {
      trades = trades.filter((t) => (t.issuer.sector || 'unknown') === f.sector);
    }

    if (f.issuer) {
      trades = trades.filter((t) => t.issuer.id === f.issuer);
    }

    return trades;
  });

  const hasActiveFilter = () => {
    const f = filter();
    return f.month || f.type || f.sector || f.issuer;
  };

  const clearFilters = () => setFilter({});

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

  const getFilterLabel = () => {
    const f = filter();
    if (f.month) {
      const [year, month] = f.month.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (f.type) return f.type === 'buy' ? 'Buy trades' : 'Sell trades';
    if (f.sector) return SECTOR_LABELS[f.sector] || f.sector;
    if (f.issuer) {
      const trade = allStateTrades().find((t) => t.issuer.id === f.issuer);
      return trade?.issuer.ticker || f.issuer;
    }
    return '';
  };

  const statItems = () => {
    const s = state();
    if (!s) return [];
    return [
      { value: s.trades.toLocaleString(), label: 'Trades', icon: 'trades' as const },
      { value: s.politicians.toString(), label: 'Politicians', icon: 'politicians' as const },
      { value: s.issuers.toString(), label: 'Issuers', icon: 'issuers' as const },
      { value: s.volume, label: 'Volume', icon: 'volume' as const },
      { value: s.dateLastTraded || '-', label: 'Last Traded', icon: 'filings' as const },
    ];
  };

  return (
    <div class="state-detail">
      <ChartTooltip />
      <A href="/states" class="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to States
      </A>

      <Show when={state()} fallback={<div class="not-found">State not found</div>}>
        {(s) => {
          const composition = () => formatSenateComposition(s().senateComposition);
          return (
            <>
              <div class="state-detail--header" classList={{ [`party--${s().party.toLowerCase()}`]: true }}>
                <div class="state-detail--profile">
                  <div class="state-detail--outline">
                    <img src={s().outlineUrl} alt="" />
                  </div>
                  <div class="state-detail--info">
                    <h1>{s().name}</h1>
                    <div class="state-detail--meta">
                      <span class="capital">{s().capital}</span>
                      <div class="senate-composition">
                        <span class="senate-label">Senate:</span>
                        <span class="senate-value">{composition().label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <StatsRow stats={statItems()} />

              <div class="state-detail--charts">
                <TradingActivityChart
                  trades={issuerFilteredTrades()}
                  selectedMonth={filter().month}
                  onMonthClick={(month) => setFilter((f) => ({ ...f, month }))}
                />
                <TradeTypeChart
                  trades={issuerFilteredTrades()}
                  selectedType={filter().type}
                  onTypeClick={(type) => setFilter((f) => ({ ...f, type }))}
                />
                <SectorBreakdownChart
                  trades={issuerFilteredTrades()}
                  selectedSector={filter().sector}
                  onSectorClick={(sector) => setFilter((f) => ({ ...f, sector }))}
                />
                <TopIssuersChart
                  trades={allStateTrades()}
                  selectedIssuer={filter().issuer}
                  onIssuerClick={(issuer) => setFilter({ issuer })}
                />
              </div>

              <Show when={statePoliticians().length > 0}>
                <div class="state-detail--politicians">
                  <h2>Politicians from {s().name}</h2>
                  <div class="politicians-grid">
                    <For each={statePoliticians()}>
                      {(politician) => (
                        <A href={`/politicians/${politician.id}`}>
                          <PoliticianCard politician={politician} maxTraits={2} />
                        </A>
                      )}
                    </For>
                  </div>
                </div>
              </Show>

              <div class="state-detail--trades">
                <div class="trades-header">
                  <h2>Recent Trades</h2>
                  <Show when={hasActiveFilter()}>
                    <div class="filter-badge">
                      <span>{getFilterLabel()}</span>
                      <span class="filter-count">({filteredTrades().length} trades)</span>
                      <button onClick={clearFilters} title="Clear filter">&times;</button>
                    </div>
                  </Show>
                </div>
                <Show
                  when={filteredTrades().length > 0}
                  fallback={<p class="no-trades">No trades found for politicians from this state.</p>}
                >
                  <TradesTable trades={filteredTrades().slice(0, 50)} />
                </Show>
              </div>
            </>
          );
        }}
      </Show>
    </div>
  );
}
