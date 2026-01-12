import './style.css';

import { A } from '@solidjs/router';
import { createSignal, createMemo, For, Show } from 'solid-js';

import { StatsRow } from '../../components/stats-row';
import { StateCard } from '../../components/state-card';
import { getStates, isStatesLoading } from '../../data/states';

type SortOption = 'name' | 'trades' | 'politicians';

export function States() {
  const [search, setSearch] = createSignal('');
  const [sortBy, setSortBy] = createSignal<SortOption>('name');

  const filteredStates = createMemo(() => {
    const query = search().toLowerCase();
    let states = getStates();

    if (query) {
      states = states.filter((s) => s.name.toLowerCase().includes(query));
    }

    switch (sortBy()) {
      case 'trades':
        return [...states].sort((a, b) => b.trades - a.trades);
      case 'politicians':
        return [...states].sort((a, b) => b.politicians - a.politicians);
      default:
        return [...states].sort((a, b) => a.name.localeCompare(b.name));
    }
  });

  const stats = createMemo(() => {
    const all = getStates();
    const totalTrades = all.reduce((sum, s) => sum + s.trades, 0);
    const totalPoliticians = all.reduce((sum, s) => sum + s.politicians, 0);
    const totalVolume = all.reduce((sum, s) => {
      const vol = s.volume.replace(/[$,KMB]/g, '');
      const num = parseFloat(vol) || 0;
      if (s.volume.includes('B')) return sum + num * 1_000_000_000;
      if (s.volume.includes('M')) return sum + num * 1_000_000;
      if (s.volume.includes('K')) return sum + num * 1_000;
      return sum + num;
    }, 0);

    const formatVol = (v: number) => {
      if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`;
      if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
      return `$${(v / 1_000).toFixed(0)}K`;
    };

    return [
      { value: all.length.toString(), label: 'States', icon: 'issuers' as const },
      { value: totalTrades.toLocaleString(), label: 'Trades', icon: 'trades' as const },
      { value: totalPoliticians.toLocaleString(), label: 'Politicians', icon: 'politicians' as const },
      { value: formatVol(totalVolume), label: 'Volume', icon: 'volume' as const },
    ];
  });

  return (
    <div class="states-page">
      <div class="states-page--header">
        <svg class="star-icon" viewBox="0 0 14 14" fill="currentColor">
          <path d="M7 0l1.76 4.84L14 5.27l-3.8 3.32.96 5.41L7 11.5 2.84 14l.96-5.41L0 5.27l5.24-.43L7 0z" />
        </svg>
        <h1>States</h1>
        <span class="time-range">3 Years</span>
      </div>

      <div class="states-page--controls">
        <div class="search-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search states..."
            value={search()}
            onInput={(e) => setSearch(e.currentTarget.value)}
          />
        </div>

        <div class="sort-wrapper">
          <label for="sort-select">Sort by</label>
          <select
            id="sort-select"
            value={sortBy()}
            onChange={(e) => setSortBy(e.currentTarget.value as SortOption)}
          >
            <option value="name">Name</option>
            <option value="trades">Trades</option>
            <option value="politicians">Politicians</option>
          </select>
        </div>
      </div>

      <StatsRow stats={stats()} />

      <Show when={!isStatesLoading()} fallback={<div class="loading">Loading states...</div>}>
        <div class="states-page--grid">
          <For each={filteredStates()}>
            {(state) => (
              <A href={`/states/${state.id}`}>
                <StateCard state={state} />
              </A>
            )}
          </For>
        </div>
        <Show when={filteredStates().length === 0}>
          <p class="no-results">No states match your search.</p>
        </Show>
      </Show>
    </div>
  );
}
