import './style.css';

import { A, useParams } from '@solidjs/router';
import { Show, For, createMemo, createResource } from 'solid-js';

import { getTeamBySlug } from '../../data/politician-bios';
import { fetchTeamStats, type ESPNTeamStats } from '../../services/espn-api';

export function SportsTeam() {
  const params = useParams<{ slug: string }>();

  const teamData = createMemo(() => getTeamBySlug(params.slug));

  // Fetch ESPN team stats
  const [espnStats] = createResource(
    () => teamData(),
    async (data) => {
      if (!data) return null;
      return fetchTeamStats(data.team.name, data.team.league);
    }
  );

  return (
    <div class="sports-team-page">
      <Show
        when={teamData()}
        fallback={
          <div class="not-found">
            <h2>Team Not Found</h2>
            <p>We couldn't find any politicians supporting this team.</p>
            <A href="/politicians">Browse all politicians</A>
          </div>
        }
      >
        {(data) => (
          <>
            <header class="sports-team-page--header">
              <img
                src={data().team.logoUrl}
                alt={data().team.name}
                class="sports-team-page--logo"
              />
              <div class="sports-team-page--info">
                <span class="league-badge">{data().team.league}</span>
                <h1>{data().team.name}</h1>
                <p class="supporter-count">
                  {data().politicians.length} politician{data().politicians.length !== 1 ? 's' : ''} supporting this team
                </p>
              </div>
            </header>

            {/* Team Stats Section */}
            <section class="sports-team-page--stats">
              {/* Team Performance Stats */}
              <div class="stats-card team-performance">
                <h3>Team Performance</h3>
                <Show
                  when={!espnStats.loading && espnStats()}
                  fallback={
                    <div class="stats-loading">
                      {espnStats.loading ? 'Loading stats...' : 'Stats unavailable'}
                    </div>
                  }
                >
                  {(stats) => (
                    <div class="stats-grid">
                      <div class="stat-item">
                        <span class="stat-value">{stats().record}</span>
                        <span class="stat-label">Record</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-value">{stats().winPct}</span>
                        <span class="stat-label">Win %</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-value">{stats().standing}</span>
                        <span class="stat-label">Standing</span>
                      </div>
                      <Show when={stats().streak}>
                        <div class="stat-item">
                          <span class="stat-value">{stats().streak}</span>
                          <span class="stat-label">Streak</span>
                        </div>
                      </Show>
                    </div>
                  )}
                </Show>
              </div>

              {/* Aggregate Trading Stats */}
              <div class="stats-card trading-stats">
                <h3>Supporter Trading Activity</h3>
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-value">{data().aggregateStats.totalTrades}</span>
                    <span class="stat-label">Total Trades</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{data().aggregateStats.totalVolume}</span>
                    <span class="stat-label">Total Volume</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{data().aggregateStats.totalFilings}</span>
                    <span class="stat-label">Total Filings</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{data().aggregateStats.avgTradesPerPolitician}</span>
                    <span class="stat-label">Avg Trades/Pol</span>
                  </div>
                </div>
              </div>

              {/* Party Breakdown */}
              <div class="stats-card party-breakdown">
                <h3>Party Breakdown</h3>
                <div class="party-bars">
                  <div class="party-bar">
                    <div class="party-info">
                      <span class="party-label democrat">Democrat</span>
                      <span class="party-count">{data().aggregateStats.democratCount}</span>
                    </div>
                    <div class="bar-track">
                      <div
                        class="bar-fill democrat"
                        style={{
                          width: `${(data().aggregateStats.democratCount / data().politicians.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div class="party-bar">
                    <div class="party-info">
                      <span class="party-label republican">Republican</span>
                      <span class="party-count">{data().aggregateStats.republicanCount}</span>
                    </div>
                    <div class="bar-track">
                      <div
                        class="bar-fill republican"
                        style={{
                          width: `${(data().aggregateStats.republicanCount / data().politicians.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section class="sports-team-page--supporters">
              <h2>Political Supporters</h2>
              <div class="supporters-grid">
                <For each={data().politicians}>
                  {(politician) => (
                    <A
                      href={`/politicians/${politician.id}/bio`}
                      class="supporter-card"
                    >
                      <img
                        src={politician.photoUrl}
                        alt={politician.name}
                        class="supporter-card--photo"
                      />
                      <div class="supporter-card--info">
                        <span class="name">{politician.name}</span>
                        <span
                          class="meta"
                          classList={{
                            democrat: politician.party === 'Democrat',
                            republican: politician.party === 'Republican',
                          }}
                        >
                          {politician.party} | {politician.chamber} | {politician.state}
                        </span>
                      </div>
                      <div class="supporter-card--stats">
                        <div class="stat">
                          <span class="value">{politician.trades}</span>
                          <span class="label">Trades</span>
                        </div>
                        <div class="stat">
                          <span class="value">{politician.filings}</span>
                          <span class="label">Filings</span>
                        </div>
                        <div class="stat">
                          <span class="value">{politician.volume}</span>
                          <span class="label">Volume</span>
                        </div>
                      </div>
                    </A>
                  )}
                </For>
              </div>
            </section>

            <A href="/politicians" class="back-link">
              View all politicians
            </A>
          </>
        )}
      </Show>
    </div>
  );
}
