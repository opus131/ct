import './style.css';

import { A, useParams } from '@solidjs/router';
import { Show, For, createSignal, createMemo, createResource } from 'solid-js';

import { StatsRow } from '../../components/stats-row';
import { TradesTable } from '../../components/trades-table';
import { PoliticianCard } from '../../components/politician-card';
import {
  TradingActivityChart,
  TradeTypeChart,
  ChartTooltip,
} from '../../components/charts';
import { PriceChart } from '../../components/charts/price-chart';
import { TopPoliticiansChart } from '../../components/charts/top-politicians-chart';
import { getIssuerById, getTradesForIssuer, getIssuerPerformance } from '../../data/issuers';
import { getPoliticianById } from '../../data/politicians';
import type { TradeType, Politician } from '../../data/types';

type FilterState = {
  month?: string | null;
  type?: TradeType | null;
  politician?: string | null;
};

export function IssuerDetail() {
  const params = useParams<{ id: string }>();
  const issuer = () => getIssuerById(params.id);
  const allTrades = () => getTradesForIssuer(params.id);

  const [performanceData] = createResource(
    () => params.id,
    async (id) => getIssuerPerformance(id)
  );

  const [filter, setFilter] = createSignal<FilterState>({});

  const filteredTrades = createMemo(() => {
    let trades = allTrades();
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

    if (f.politician) {
      trades = trades.filter((t) => t.politician.id === f.politician);
    }

    return trades;
  });

  const tradingPoliticians = createMemo(() => {
    const trades = allTrades();
    const politicianIds = new Set(trades.map((t) => t.politician.id));
    const politicians: Politician[] = [];

    politicianIds.forEach((id) => {
      const p = getPoliticianById(id);
      if (p) politicians.push(p);
    });

    return politicians.sort((a, b) => b.trades - a.trades).slice(0, 12);
  });

  const hasActiveFilter = () => {
    const f = filter();
    return f.month || f.type || f.politician;
  };

  const clearFilters = () => setFilter({});

  const getFilterLabel = () => {
    const f = filter();
    if (f.month) {
      const [year, month] = f.month.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (f.type) return f.type === 'buy' ? 'Buy trades' : 'Sell trades';
    if (f.politician) {
      const trade = allTrades().find((t) => t.politician.id === f.politician);
      return trade?.politician.name || f.politician;
    }
    return '';
  };

  const tickerInitial = () => {
    const i = issuer();
    if (!i) return '?';
    if (i.ticker && i.ticker !== 'N/A') {
      return i.ticker.split(':')[0].charAt(0).toUpperCase();
    }
    return i.name.charAt(0).toUpperCase();
  };

  const statItems = () => {
    const i = issuer();
    if (!i) return [];
    return [
      { value: i.trades.toLocaleString(), label: 'Trades', icon: 'trades' as const },
      { value: i.politicians, label: 'Politicians', icon: 'politicians' as const },
      { value: i.volume, label: 'Volume', icon: 'volume' as const },
      { value: i.dateLastTraded || '-', label: 'Last Traded', icon: 'filings' as const },
    ];
  };

  return (
    <div class="issuer-detail">
      <ChartTooltip />

      <A href="/issuers" class="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Issuers
      </A>

      <Show when={issuer()} fallback={<div class="not-found">Issuer not found</div>}>
        {(i) => (
          <>
            <div class="issuer-detail--header">
              <div class="issuer-detail--profile">
                <div class="issuer-detail--badge">
                  <span class="badge-letter">{tickerInitial()}</span>
                </div>
                <div class="issuer-detail--info">
                  <h1>{i().name}</h1>
                  <div class="issuer-detail--meta">
                    <span class="ticker">{i().ticker}</span>
                    <Show when={i().sector}>
                      <span class="sector">{i().sector}</span>
                    </Show>
                    <Show when={i().country}>
                      <span class="country">{i().country}</span>
                    </Show>
                  </div>
                </div>
              </div>
              <Show when={performanceData()?.trailing365}>
                <div class="issuer-detail--performance">
                  <span class="label">1Y Performance</span>
                  <span
                    class="value"
                    classList={{
                      positive: (performanceData()?.trailing365 || 0) > 0,
                      negative: (performanceData()?.trailing365 || 0) < 0,
                    }}
                  >
                    {(performanceData()?.trailing365 || 0) > 0 ? '+' : ''}
                    {performanceData()?.trailing365?.toFixed(2)}%
                  </span>
                </div>
              </Show>
            </div>

            <StatsRow stats={statItems()} />

            <div class="issuer-detail--charts">
              <Show when={performanceData()?.eodPrices?.length}>
                <PriceChart
                  prices={performanceData()!.eodPrices}
                  title="Price History"
                />
              </Show>
              <TradingActivityChart
                trades={allTrades()}
                selectedMonth={filter().month}
                onMonthClick={(month) => setFilter({ month })}
              />
              <TradeTypeChart
                trades={allTrades()}
                selectedType={filter().type}
                onTypeClick={(type) => setFilter({ type })}
              />
              <TopPoliticiansChart
                trades={allTrades()}
                selectedPolitician={filter().politician}
                onPoliticianClick={(politician) => setFilter({ politician })}
              />
            </div>

            <Show when={tradingPoliticians().length > 0}>
              <div class="issuer-detail--politicians">
                <h2>Politicians Trading This Issuer</h2>
                <div class="politicians-grid">
                  <For each={tradingPoliticians()}>
                    {(politician) => (
                      <A href={`/politicians/${politician.id}`}>
                        <PoliticianCard politician={politician} maxTraits={2} />
                      </A>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            <div class="issuer-detail--trades">
              <div class="trades-header">
                <h2>Trading History</h2>
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
                fallback={<p class="no-trades">No trades found for this issuer.</p>}
              >
                <TradesTable trades={filteredTrades().slice(0, 50)} />
              </Show>
            </div>
          </>
        )}
      </Show>
    </div>
  );
}
