import './style.css';

import { A } from '@solidjs/router';
import { createSignal, createMemo, For, Show } from 'solid-js';

import { StatsRow } from '../../components/stats-row';
import { CommitteeCard } from '../../components/committee-card';
import { getCommittees, getSenateCommittees, getHouseCommittees, isCommitteesLoading } from '../../data/committees';

export function Committees() {
  const [search, setSearch] = createSignal('');

  const filteredSenate = createMemo(() => {
    const query = search().toLowerCase();
    if (!query) return getSenateCommittees();
    return getSenateCommittees().filter((c) => c.name.toLowerCase().includes(query));
  });

  const filteredHouse = createMemo(() => {
    const query = search().toLowerCase();
    if (!query) return getHouseCommittees();
    return getHouseCommittees().filter((c) => c.name.toLowerCase().includes(query));
  });

  const stats = createMemo(() => {
    const all = getCommittees();
    const totalTrades = all.reduce((sum, c) => sum + c.trades, 0);
    const totalPoliticians = all.reduce((sum, c) => sum + c.politicians, 0);

    return [
      { value: all.length.toString(), label: 'Committees', icon: 'issuers' as const },
      { value: totalTrades.toLocaleString(), label: 'Trades', icon: 'trades' as const },
      { value: totalPoliticians.toLocaleString(), label: 'Politicians', icon: 'politicians' as const },
    ];
  });

  return (
    <div class="committees-page">
      <div class="committees-page--header">
        <svg class="star-icon" viewBox="0 0 14 14" fill="currentColor">
          <path d="M7 0l1.76 4.84L14 5.27l-3.8 3.32.96 5.41L7 11.5 2.84 14l.96-5.41L0 5.27l5.24-.43L7 0z" />
        </svg>
        <h1>Committees</h1>
        <span class="time-range">3 Years</span>
      </div>

      <div class="committees-page--search">
        <div class="search-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search committees..."
            value={search()}
            onInput={(e) => setSearch(e.currentTarget.value)}
          />
        </div>
      </div>

      <StatsRow stats={stats()} />

      <Show when={!isCommitteesLoading()} fallback={<div class="loading">Loading committees...</div>}>
        <section class="committees-section">
          <h2 class="section-header">Senate</h2>
          <div class="committees-page--grid">
            <For each={filteredSenate()}>
              {(committee) => (
                <A href={`/committees/${committee.id}`}>
                  <CommitteeCard committee={committee} />
                </A>
              )}
            </For>
          </div>
          <Show when={filteredSenate().length === 0}>
            <p class="no-results">No Senate committees match your search.</p>
          </Show>
        </section>

        <section class="committees-section">
          <h2 class="section-header">House</h2>
          <div class="committees-page--grid">
            <For each={filteredHouse()}>
              {(committee) => (
                <A href={`/committees/${committee.id}`}>
                  <CommitteeCard committee={committee} />
                </A>
              )}
            </For>
          </div>
          <Show when={filteredHouse().length === 0}>
            <p class="no-results">No House committees match your search.</p>
          </Show>
        </section>
      </Show>
    </div>
  );
}
