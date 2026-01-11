import './style.css';

import { createSignal, createMemo, createEffect } from 'solid-js';

import { StatsRow } from '../../components/stats-row';
import { TradesTable } from '../../components/trades-table';
import { TradesFilterBar } from './filter-bar';
import { trades as allTrades } from '../../data/trades';

const TRADES_PER_PAGE = 20;

type FilterState = {
  politician: string;
  issuer: string;
  chamber: string;
  party: string;
  state: string;
  transactionType: string;
  tradeSize: string;
  owner: string;
};

export function Trades() {
  const [filters, setFilters] = createSignal<FilterState>({
    politician: '',
    issuer: '',
    chamber: '',
    party: '',
    state: '',
    transactionType: '',
    tradeSize: '',
    owner: '',
  });
  const [currentPage, setCurrentPage] = createSignal(1);

  const filteredTrades = createMemo(() => {
    const f = filters();
    return allTrades.filter((trade) => {
      if (f.politician && !trade.politician.name.toLowerCase().includes(f.politician.toLowerCase())) {
        return false;
      }
      if (f.issuer && !trade.issuer.name.toLowerCase().includes(f.issuer.toLowerCase())) {
        return false;
      }
      if (f.chamber && trade.politician.chamber !== f.chamber) {
        return false;
      }
      if (f.party && trade.politician.party !== f.party) {
        return false;
      }
      if (f.state && trade.politician.state !== f.state) {
        return false;
      }
      if (f.transactionType && trade.type !== f.transactionType) {
        return false;
      }
      if (f.tradeSize && trade.sizeRange !== f.tradeSize) {
        return false;
      }
      if (f.owner && trade.owner !== f.owner) {
        return false;
      }
      return true;
    });
  });

  // Reset to page 1 when filters change
  createEffect(() => {
    filters();
    setCurrentPage(1);
  });

  const totalPages = createMemo(() => Math.max(1, Math.ceil(filteredTrades().length / TRADES_PER_PAGE)));

  const paginatedTrades = createMemo(() => {
    const start = (currentPage() - 1) * TRADES_PER_PAGE;
    return filteredTrades().slice(start, start + TRADES_PER_PAGE);
  });

  const goToPage = (page: number) => {
    const total = totalPages();
    if (page >= 1 && page <= total) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredStats = createMemo(() => {
    const trades = filteredTrades();
    const uniquePoliticians = new Set(trades.map((t) => t.politician.id));
    const uniqueIssuers = new Set(trades.map((t) => t.issuer.id));
    return {
      trades: trades.length,
      filings: Math.ceil(trades.length / 3),
      volume: trades.length > 0 ? `$${(trades.length * 50000 / 1000000).toFixed(2)}M` : '$0',
      politicians: uniquePoliticians.size,
      issuers: uniqueIssuers.size,
    };
  });

  const statItems = createMemo(() => [
    { value: filteredStats().trades.toLocaleString(), label: 'Trades', icon: 'trades' as const },
    { value: filteredStats().filings.toLocaleString(), label: 'Filings', icon: 'filings' as const },
    { value: filteredStats().volume, label: 'Volume', icon: 'volume' as const },
    { value: filteredStats().politicians, label: 'Politicians', icon: 'politicians' as const },
    { value: filteredStats().issuers, label: 'Issuers', icon: 'issuers' as const },
  ]);

  return (
    <div class="trades-page">
      <div class="trades-page--header">
        <h1>Trades</h1>
        <span class="time-range">3 Years</span>
      </div>

      <TradesFilterBar onFilterChange={setFilters} />

      <StatsRow stats={statItems()} />

      <div class="trades-page--content">
        {filteredTrades().length > 0 ? (
          <TradesTable trades={paginatedTrades()} showAIInsights />
        ) : (
          <div class="no-results">
            <p>No trades match your filters</p>
          </div>
        )}
      </div>

      <div class="pagination">
        <button
          class="pagination--btn"
          disabled={currentPage() === 1}
          onClick={() => goToPage(1)}
          title="First page"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m11 17-5-5 5-5M18 17l-5-5 5-5" />
          </svg>
        </button>
        <button
          class="pagination--btn"
          disabled={currentPage() === 1}
          onClick={() => goToPage(currentPage() - 1)}
          title="Previous page"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <span class="pagination--info">
          Page <strong>{currentPage()}</strong> of <strong>{totalPages()}</strong>
        </span>
        <button
          class="pagination--btn"
          disabled={currentPage() === totalPages()}
          onClick={() => goToPage(currentPage() + 1)}
          title="Next page"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
        <button
          class="pagination--btn"
          disabled={currentPage() === totalPages()}
          onClick={() => goToPage(totalPages())}
          title="Last page"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m13 17 5-5-5-5M6 17l5-5-5-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
