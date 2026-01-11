import './style.css';

import { useParams } from '@solidjs/router';
import { Show, For, createSignal, createMemo, createResource } from 'solid-js';

import { StatsRow } from '../../components/stats-row';
import { TradesTable } from '../../components/trades-table';
import { PoliticianTabs } from '../../components/politician-tabs';
import { TraitBadge } from '../../components/trait-badge';
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
import type { TraitId } from '../../data/traits';

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

function formatTenureDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function getCongressLabel(congressId: string): string {
  const num = parseInt(congressId, 10);
  if (isNaN(num)) return congressId;
  const suffix = num % 10 === 1 && num !== 11 ? 'st' :
                 num % 10 === 2 && num !== 12 ? 'nd' :
                 num % 10 === 3 && num !== 13 ? 'rd' : 'th';
  return `${num}${suffix} Congress`;
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
                    <Show when={p().district}>
                      <span class="district">District {p().district}</span>
                    </Show>
                    <span class="state">{p().state}</span>
                  </div>
                  <Show when={p().traits && p().traits!.length > 0}>
                    <div class="politician-detail--traits">
                      <For each={p().traits as TraitId[]}>
                        {(traitId) => <TraitBadge traitId={traitId} size="md" />}
                      </For>
                    </div>
                  </Show>
                  <Show when={p().socialLinks}>
                    <div class="politician-detail--social">
                      <Show when={p().socialLinks?.twitter}>
                        <a href={`https://twitter.com/${p().socialLinks!.twitter}`} target="_blank" rel="noopener noreferrer" class="social-link" title="Twitter">
                          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                      </Show>
                      <Show when={p().socialLinks?.facebook}>
                        <a href={`https://facebook.com/${p().socialLinks!.facebook}`} target="_blank" rel="noopener noreferrer" class="social-link" title="Facebook">
                          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </a>
                      </Show>
                      <Show when={p().socialLinks?.youtube}>
                        <a href={`https://youtube.com/${p().socialLinks!.youtube}`} target="_blank" rel="noopener noreferrer" class="social-link" title="YouTube">
                          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        </a>
                      </Show>
                      <Show when={p().socialLinks?.website}>
                        <a href={p().socialLinks!.website} target="_blank" rel="noopener noreferrer" class="social-link" title="Website">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        </a>
                      </Show>
                    </div>
                  </Show>
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

            <Show when={p().committees && p().committees!.length > 0}>
              <div class="politician-detail--committees">
                <h3>Committee Assignments</h3>
                <div class="committees-list">
                  <For each={p().committees}>
                    {(committee) => (
                      <div class="committee-item">
                        <span>{committee.name}</span>
                        <Show when={committee.rank}>
                          <span class="committee-rank">Rank {committee.rank}</span>
                        </Show>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            <Show when={p().tenure && p().tenure!.length > 0}>
              <div class="politician-detail--tenure">
                <h3>Service History</h3>
                <div class="tenure-list">
                  <For each={p().tenure}>
                    {(tenure) => (
                      <div class="tenure-item">
                        <span class="tenure-chamber">{tenure.chamber}</span>
                        <span class="tenure-dates">
                          {formatTenureDate(tenure.startDate)} – {formatTenureDate(tenure.endDate)}
                        </span>
                        <span class="tenure-congress">{getCongressLabel(tenure.congressId)}</span>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>

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
