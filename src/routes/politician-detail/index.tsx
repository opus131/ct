import './style.css';

import { useParams } from '@solidjs/router';
import { Show, createSignal, createMemo, createResource } from 'solid-js';

import { StatsRow } from '../../components/stats-row';
import { TradesTable } from '../../components/trades-table';
import { PoliticianTabs } from '../../components/politician-tabs';
import {
  TradingActivityChart,
  TradeTypeChart,
  SectorBreakdownChart,
  TopIssuersChart,
  ChartTooltip,
} from '../../components/charts';
import { getPoliticianById } from '../../data/politicians';
import { getMockTradesForPolitician } from '../../data/mock-trades';
import { getIssuerPerformance, getSP500Performance } from '../../data/issuers';
import type { TradeType } from '../../data/types';

type FilterState = {
  month?: string | null;
  type?: TradeType | null;
  sector?: string | null;
  issuer?: string | null;
};

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function formatBirthDate(dob: string): string {
  const date = new Date(dob);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function PoliticianDetail() {
  const params = useParams<{ id: string }>();
  const politician = () => getPoliticianById(params.id);
  const allTrades = () => getMockTradesForPolitician(params.id);

  const [filter, setFilter] = createSignal<FilterState>({});

  // Load issuer performance data when an issuer is selected
  const [issuerPerformance] = createResource(
    () => filter().issuer,
    async (issuerId) => {
      if (!issuerId) return null;
      return getIssuerPerformance(issuerId);
    }
  );

  // Load S&P 500 benchmark data
  const [sp500Performance] = createResource(getSP500Performance);

  // Trades filtered by issuer only (for charts that should reflect issuer selection)
  const issuerFilteredTrades = createMemo(() => {
    const f = filter();
    if (!f.issuer) return allTrades();
    return allTrades().filter((t) => t.issuer.id === f.issuer);
  });

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
      const trade = allTrades().find((t) => t.issuer.id === f.issuer);
      return trade?.issuer.ticker || f.issuer;
    }
    return '';
  };

  const statItems = () => {
    const p = politician();
    if (!p) return [];
    return [
      { value: p.trades, label: 'Trades', icon: 'trades' as const },
      { value: p.filings, label: 'Filings', icon: 'filings' as const },
      { value: p.volume, label: 'Volume', icon: 'volume' as const },
      { value: p.issuers, label: 'Issuers', icon: 'issuers' as const },
    ];
  };

  return (
    <div class="politician-detail">
      <ChartTooltip />
      <Show when={politician()} fallback={<div class="not-found">Politician not found</div>}>
        {(p) => (
          <>
            <PoliticianTabs politicianId={p().id} />
            <div class="politician-detail--header">
              <div class="politician-detail--profile">
                <img src={p().photoUrl} alt={p().name} class="politician-detail--photo" />
                <div class="politician-detail--info">
                  <h1>{p().name}</h1>
                  <div class="politician-detail--meta">
                    <span class={`badge badge-${p().party.toLowerCase()}`}>{p().party}</span>
                    <span class="chamber">{p().chamber}</span>
                    <span class="state">{p().state}</span>
                  </div>
                </div>
              </div>
              <div class="politician-detail--info-cards">
                <Show when={p().dob}>
                  <div class="politician-detail--info-card">
                    <span class="label">Born</span>
                    <span class="value">{formatBirthDate(p().dob!)}</span>
                    <span class="sub">Age {calculateAge(p().dob!)}</span>
                  </div>
                </Show>
                <Show when={p().yearsActive}>
                  <div class="politician-detail--info-card">
                    <span class="label">Years Active</span>
                    <span class="value">{p().yearsActive}</span>
                  </div>
                </Show>
                <div class="politician-detail--info-card">
                  <span class="label">Last Traded</span>
                  <span class="value">{p().lastTraded}</span>
                </div>
              </div>
            </div>

            <StatsRow stats={statItems()} />

            <div class="politician-detail--charts">
              <TradingActivityChart
                trades={issuerFilteredTrades()}
                prices={issuerPerformance()?.eodPrices}
                sp500Prices={sp500Performance()?.eodPrices}
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
                trades={allTrades()}
                selectedIssuer={filter().issuer}
                onIssuerClick={(issuer) => setFilter({ issuer })}
              />
            </div>

            <div class="politician-detail--trades">
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
                fallback={<p class="no-trades">No trades found matching the current filter.</p>}
              >
                <TradesTable trades={filteredTrades().slice(0, 50)} showAIInsights hidePolitician />
              </Show>
            </div>
          </>
        )}
      </Show>
    </div>
  );
}
