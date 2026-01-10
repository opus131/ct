import { createSignal } from 'solid-js';

import type { Trade } from '../../data/types';

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

type Props = {
  onFilterChange: (filters: FilterState) => void;
};

const chambers = ['All', 'House', 'Senate'];
const parties = ['All', 'Democrat', 'Republican', 'Independent'];
const states = ['All', 'AL', 'CA', 'FL', 'GA', 'IL', 'IN', 'NC', 'NJ', 'NY', 'OH', 'PA', 'SC', 'TX'];
const transactionTypes = ['All', 'Buy', 'Sell'];
const tradeSizes = ['All', '1K-15K', '15K-50K', '50K-100K', '100K-250K', '250K-500K', '500K-1M', '1M+'];
const owners = ['All', 'Self', 'Joint', 'Spouse', 'Dependent', 'Undisclosed'];

export function TradesFilterBar(props: Props) {
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

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters(), [key]: value };
    setFilters(newFilters);
    props.onFilterChange(newFilters);
  };

  return (
    <div class="trades-filter-bar">
      <div class="filter-row">
        <div class="search-input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Find by politician"
            value={filters().politician}
            onInput={(e) => updateFilter('politician', e.currentTarget.value)}
          />
        </div>

        <div class="search-input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Find by issuer"
            value={filters().issuer}
            onInput={(e) => updateFilter('issuer', e.currentTarget.value)}
          />
        </div>

        <div class="select-wrapper">
          <select
            value={filters().chamber}
            onChange={(e) => updateFilter('chamber', e.currentTarget.value)}
          >
            <option value="">Congress Chamber</option>
            {chambers.map((c) => (
              <option value={c === 'All' ? '' : c}>{c}</option>
            ))}
          </select>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        <div class="select-wrapper">
          <select
            value={filters().party}
            onChange={(e) => updateFilter('party', e.currentTarget.value)}
          >
            <option value="">Political Party</option>
            {parties.map((p) => (
              <option value={p === 'All' ? '' : p}>{p}</option>
            ))}
          </select>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        <div class="select-wrapper">
          <select
            value={filters().state}
            onChange={(e) => updateFilter('state', e.currentTarget.value)}
          >
            <option value="">Politician State</option>
            {states.map((s) => (
              <option value={s === 'All' ? '' : s}>{s}</option>
            ))}
          </select>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      <div class="filter-row">
        <div class="select-wrapper">
          <select
            value={filters().transactionType}
            onChange={(e) => updateFilter('transactionType', e.currentTarget.value)}
          >
            <option value="">Transaction Type</option>
            {transactionTypes.map((t) => (
              <option value={t === 'All' ? '' : t.toLowerCase()}>{t}</option>
            ))}
          </select>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        <div class="select-wrapper">
          <select
            value={filters().tradeSize}
            onChange={(e) => updateFilter('tradeSize', e.currentTarget.value)}
          >
            <option value="">Trade Size</option>
            {tradeSizes.map((s) => (
              <option value={s === 'All' ? '' : s}>{s}</option>
            ))}
          </select>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        <div class="select-wrapper">
          <select
            value={filters().owner}
            onChange={(e) => updateFilter('owner', e.currentTarget.value)}
          >
            <option value="">Owner</option>
            {owners.map((o) => (
              <option value={o === 'All' ? '' : o}>{o}</option>
            ))}
          </select>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        <button class="clear-btn" onClick={() => {
          const emptyFilters: FilterState = {
            politician: '',
            issuer: '',
            chamber: '',
            party: '',
            state: '',
            transactionType: '',
            tradeSize: '',
            owner: '',
          };
          setFilters(emptyFilters);
          props.onFilterChange(emptyFilters);
        }}>
          Clear Filters
        </button>
      </div>
    </div>
  );
}
