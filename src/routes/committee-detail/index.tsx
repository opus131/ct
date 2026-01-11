import './style.css';

import { A, useParams } from '@solidjs/router';
import { Show, For, createMemo } from 'solid-js';

import { StatsRow } from '../../components/stats-row';
import { TradesTable } from '../../components/trades-table';
import { PoliticianCard } from '../../components/politician-card';
import { getCommitteeById } from '../../data/committees';
import { getPoliticians, getTrades } from '../../data/data-service';

export function CommitteeDetail() {
  const params = useParams<{ id: string }>();
  const committee = () => getCommitteeById(params.id);

  const backgroundUrl = () => {
    const c = committee();
    if (!c) return null;
    return `/assets/committees/bg-${c.id}.webp`;
  };

  const memberPoliticians = createMemo(() => {
    const c = committee();
    if (!c) return [];

    const allPoliticians = getPoliticians();
    const memberIds = new Set(c.members.map((m) => m.politicianId));

    return allPoliticians
      .filter((p) => memberIds.has(p.id))
      .sort((a, b) => b.trades - a.trades);
  });

  const committeeTrades = createMemo(() => {
    const c = committee();
    if (!c) return [];

    const memberIds = new Set(c.members.map((m) => m.politicianId));
    return getTrades()
      .filter((t) => memberIds.has(t.politician.id))
      .slice(0, 50);
  });

  const statItems = () => {
    const c = committee();
    if (!c) return [];
    return [
      { value: c.trades.toLocaleString(), label: 'Trades', icon: 'trades' as const },
      { value: c.politicians.toString(), label: 'Politicians', icon: 'politicians' as const },
      { value: c.volume, label: 'Volume', icon: 'volume' as const },
      { value: c.dateLastTraded || '-', label: 'Last Traded', icon: 'filings' as const },
    ];
  };

  return (
    <div class="committee-detail">
      <A href="/committees" class="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Committees
      </A>

      <Show when={committee()} fallback={<div class="not-found">Committee not found</div>}>
        {(c) => (
          <>
            <div
              class="committee-detail--header"
              style={{ 'background-image': `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.85)), url(${backgroundUrl()})` }}
            >
              <div class="committee-detail--profile">
                <div class="committee-detail--logo">
                  <img src={c().logoUrl} alt="" />
                </div>
                <div class="committee-detail--info">
                  <h1>{c().name}</h1>
                  <div class="committee-detail--meta">
                    <span class="chamber-badge" classList={{ senate: c().chamber === 'Senate', house: c().chamber === 'House' }}>
                      {c().chamber}
                    </span>
                    <Show when={c().url}>
                      <a href={c().url} target="_blank" rel="noopener noreferrer" class="committee-url">
                        Official Website
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                        </svg>
                      </a>
                    </Show>
                  </div>
                </div>
              </div>
            </div>

            <StatsRow stats={statItems()} />

            <Show when={memberPoliticians().length > 0}>
              <div class="committee-detail--members">
                <h2>Committee Members</h2>
                <div class="members-grid">
                  <For each={memberPoliticians()}>
                    {(politician) => (
                      <A href={`/politicians/${politician.id}`}>
                        <PoliticianCard politician={politician} maxTraits={2} />
                      </A>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            <div class="committee-detail--trades">
              <h2>Recent Trades by Committee Members</h2>
              <Show
                when={committeeTrades().length > 0}
                fallback={<p class="no-trades">No trades found for this committee's members.</p>}
              >
                <TradesTable trades={committeeTrades()} />
              </Show>
            </div>
          </>
        )}
      </Show>
    </div>
  );
}
