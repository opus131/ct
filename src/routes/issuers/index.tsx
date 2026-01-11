import './style.css';

import { A } from '@solidjs/router';
import { createSignal, createMemo, createEffect, For, Show } from 'solid-js';

import { StatsRow } from '../../components/stats-row';
import { IssuerCard } from '../../components/issuer-card';
import { getIssuers, getAllSectors } from '../../data/issuers';
import type { Issuer } from '../../data/types';

const ISSUERS_PER_PAGE = 24;

type FilterState = {
  search: string;
  sector: string;
  minTrades: string;
  maxTrades: string;
  minVolume: string;
  maxVolume: string;
};

function parseVolume(vol: string): number {
  if (vol.endsWith('B')) return parseFloat(vol) * 1_000_000_000;
  if (vol.endsWith('M')) return parseFloat(vol) * 1_000_000;
  if (vol.endsWith('K')) return parseFloat(vol) * 1_000;
  return parseFloat(vol) || 0;
}

export function Issuers() {
  const [filters, setFilters] = createSignal<FilterState>({
    search: '',
    sector: '',
    minTrades: '',
    maxTrades: '',
    minVolume: '',
    maxVolume: '',
  });

  const [showFilters, setShowFilters] = createSignal(false);
  const [currentPage, setCurrentPage] = createSignal(1);

  const sectors = createMemo(() => getAllSectors());

  const filteredIssuers = createMemo(() => {
    const allIssuers = getIssuers();
    const f = filters();

    return allIssuers.filter((issuer: Issuer) => {
      // Search filter
      if (f.search) {
        const query = f.search.toLowerCase();
        const matchesName = issuer.name.toLowerCase().includes(query);
        const matchesTicker = issuer.ticker.toLowerCase().includes(query);
        if (!matchesName && !matchesTicker) return false;
      }

      // Sector filter
      if (f.sector && issuer.sector !== f.sector) {
        return false;
      }

      // Trade count filter
      if (f.minTrades && issuer.trades < parseInt(f.minTrades)) {
        return false;
      }
      if (f.maxTrades && issuer.trades > parseInt(f.maxTrades)) {
        return false;
      }

      // Volume filter
      if (f.minVolume || f.maxVolume) {
        const vol = parseVolume(issuer.volume);
        if (f.minVolume && vol < parseFloat(f.minVolume) * 1_000_000) {
          return false;
        }
        if (f.maxVolume && vol > parseFloat(f.maxVolume) * 1_000_000) {
          return false;
        }
      }

      return true;
    });
  });

  // Reset to page 1 when filters change
  createEffect(() => {
    filters();
    setCurrentPage(1);
  });

  const totalPages = createMemo(() => Math.max(1, Math.ceil(filteredIssuers().length / ISSUERS_PER_PAGE)));

  const paginatedIssuers = createMemo(() => {
    const start = (currentPage() - 1) * ISSUERS_PER_PAGE;
    return filteredIssuers().slice(start, start + ISSUERS_PER_PAGE);
  });

  const goToPage = (page: number) => {
    const total = totalPages();
    if (page >= 1 && page <= total) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const stats = createMemo(() => {
    const issuers = filteredIssuers();
    const totalTrades = issuers.reduce((sum, i) => sum + i.trades, 0);
    const totalPoliticians = new Set(issuers.flatMap((i) => i.politicians)).size || issuers.reduce((sum, i) => sum + i.politicians, 0);
    const totalVolume = issuers.reduce((sum, i) => sum + parseVolume(i.volume), 0);

    const formatVol = (v: number) => {
      if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
      if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
      if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
      return `$${v}`;
    };

    return [
      { value: totalTrades.toLocaleString(), label: 'Trades', icon: 'trades' as const },
      { value: totalPoliticians.toLocaleString(), label: 'Politicians', icon: 'politicians' as const },
      { value: formatVol(totalVolume), label: 'Volume', icon: 'volume' as const },
      { value: issuers.length.toLocaleString(), label: 'Issuers', icon: 'issuers' as const },
    ];
  });

  const clearFilters = () => {
    setFilters({
      search: '',
      sector: '',
      minTrades: '',
      maxTrades: '',
      minVolume: '',
      maxVolume: '',
    });
  };

  const hasActiveFilters = () => {
    const f = filters();
    return f.search || f.sector || f.minTrades || f.maxTrades || f.minVolume || f.maxVolume;
  };

  return (
    <div class="issuers-page">
      <div class="issuers-page--header">
        <h1>Issuers</h1>
        <span class="time-range">3 Years</span>
      </div>

      {/* Search Bar */}
      <div class="issuers-page--search">
        <div class="search-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or ticker..."
            value={filters().search}
            onInput={(e) => setFilters((f) => ({ ...f, search: e.currentTarget.value }))}
          />
        </div>
        <button
          class="filter-toggle"
          classList={{ active: showFilters() }}
          onClick={() => setShowFilters((v) => !v)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
          Filters
          <Show when={hasActiveFilters()}>
            <span class="filter-count">Active</span>
          </Show>
        </button>
      </div>

      {/* Advanced Filters Panel */}
      <Show when={showFilters()}>
        <div class="issuers-page--filters">
          <div class="filter-row">
            <div class="filter-group">
              <label>Sector</label>
              <select
                value={filters().sector}
                onChange={(e) => setFilters((f) => ({ ...f, sector: e.currentTarget.value }))}
              >
                <option value="">All Sectors</option>
                <For each={sectors()}>
                  {(sector) => <option value={sector}>{sector}</option>}
                </For>
              </select>
            </div>

            <div class="filter-group">
              <label>Min Trades</label>
              <input
                type="number"
                placeholder="0"
                value={filters().minTrades}
                onInput={(e) => setFilters((f) => ({ ...f, minTrades: e.currentTarget.value }))}
              />
            </div>

            <div class="filter-group">
              <label>Max Trades</label>
              <input
                type="number"
                placeholder="Any"
                value={filters().maxTrades}
                onInput={(e) => setFilters((f) => ({ ...f, maxTrades: e.currentTarget.value }))}
              />
            </div>

            <div class="filter-group">
              <label>Min Volume ($M)</label>
              <input
                type="number"
                placeholder="0"
                value={filters().minVolume}
                onInput={(e) => setFilters((f) => ({ ...f, minVolume: e.currentTarget.value }))}
              />
            </div>

            <div class="filter-group">
              <label>Max Volume ($M)</label>
              <input
                type="number"
                placeholder="Any"
                value={filters().maxVolume}
                onInput={(e) => setFilters((f) => ({ ...f, maxVolume: e.currentTarget.value }))}
              />
            </div>

            <Show when={hasActiveFilters()}>
              <button class="clear-filters" onClick={clearFilters}>
                Clear All
              </button>
            </Show>
          </div>
        </div>
      </Show>

      <StatsRow stats={stats()} />

      <div class="issuers-page--results-header">
        <span class="results-count">
          {filteredIssuers().length.toLocaleString()} issuer{filteredIssuers().length !== 1 ? 's' : ''}
        </span>
      </div>

      <div class="issuers-page--grid">
        <For each={paginatedIssuers()}>
          {(issuer) => (
            <A href={`/issuers/${issuer.id}`}>
              <IssuerCard issuer={issuer} />
            </A>
          )}
        </For>
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
