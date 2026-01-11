import './style.css';

import { A } from '@solidjs/router';
import { For, Show, createMemo } from 'solid-js';

import { PredictionMarkets } from '../../components/prediction-markets';
import { TradeLabelBadge } from '../../components/trade-label-badge';
import { TradeMarquee } from '../../components/trade-marquee';
import { getTrades, isTradesLoading } from '../../data/data-service';
import { politicians } from '../../data/politicians';
import { issuers } from '../../data/issuers';
import { deriveTradeLabels } from '../../data/trade-labels';

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

export function Home() {
  const latestTrades = createMemo(() => {
    const seen = new Set<string>();
    return getTrades()
      .filter((trade) => {
        if (seen.has(trade.politician.id)) return false;
        seen.add(trade.politician.id);
        return true;
      })
      .slice(0, 8);
  });

  return (
    <div class="home">
      <TradeMarquee />
      <div class="home--grid">
        <section class="home--latest-trades">
          <div class="section-header">
            <h2>Latest Trades</h2>
            <A href="/trades" class="view-all">View all</A>
          </div>
          <Show
            when={!isTradesLoading()}
            fallback={
              <div class="trades-loading">
                <span>Loading trades...</span>
              </div>
            }
          >
            <div class="trades-list">
              <For each={latestTrades()}>
                {(trade) => (
                  <A href={`/politicians/${trade.politician.id}`} class="trade-item">
                    <img
                      src={trade.politician.photoUrl}
                      alt={trade.politician.name}
                      class="trade-politician-photo"
                    />
                    <div class="trade-main">
                      <div class="trade-header">
                        <span
                          class="trade-type"
                          classList={{ buy: trade.type === 'buy', sell: trade.type === 'sell' }}
                        >
                          {trade.type.toUpperCase()}
                        </span>
                        <span class="trade-issuer-ticker">{trade.issuer.ticker}</span>
                        <span class="trade-size">{trade.sizeRange}</span>
                        <span class="trade-date">{formatRelativeDate(trade.publishedAt)}</span>
                      </div>
                      <div class="trade-details">
                        <span class="trade-politician-name">{trade.politician.name}</span>
                        <span
                          class="trade-politician-party"
                          classList={{
                            democrat: trade.politician.party === 'Democrat',
                            republican: trade.politician.party === 'Republican',
                          }}
                        >
                          {trade.politician.party[0]} · {trade.politician.chamber} · {trade.politician.state}
                        </span>
                      </div>
                      <div class="trade-issuer-name">{trade.issuer.name}</div>
                      <div class="trade-labels">
                        <For each={deriveTradeLabels(trade)}>
                          {(labelId) => <TradeLabelBadge labelId={labelId} size="sm" />}
                        </For>
                      </div>
                    </div>
                  </A>
                )}
              </For>
            </div>
          </Show>
        </section>

        <section class="home--featured-politicians">
          <div class="section-header">
            <h2>Featured Politicians</h2>
            <A href="/politicians" class="view-all">View all</A>
          </div>
          <div class="politicians-list">
            {politicians.slice(0, 3).map((politician) => (
              <A href={`/politicians/${politician.id}`} class="featured-politician">
                <img src={politician.photoUrl} alt={politician.name} />
                <div class="politician-info">
                  <span class="name">{politician.name}</span>
                  <span class="meta" classList={{ democrat: politician.party === 'Democrat', republican: politician.party === 'Republican' }}>
                    {politician.party === 'Democrat' ? 'Democrat' : 'Republican'} | {politician.chamber} | {politician.state}
                  </span>
                </div>
                <div class="politician-stats">
                  <div class="stat">
                    <span class="value">{politician.trades}</span>
                    <span class="label">Trades</span>
                  </div>
                  <div class="stat">
                    <span class="value">{politician.filings}</span>
                    <span class="label">Filings</span>
                  </div>
                  <div class="stat">
                    <span class="value">{politician.issuers}</span>
                    <span class="label">Issuers</span>
                  </div>
                  <div class="stat">
                    <span class="value">{politician.volume}</span>
                    <span class="label">Volume</span>
                  </div>
                </div>
                <div class="chart-placeholder">
                  <svg viewBox="0 0 200 60" preserveAspectRatio="none">
                    <path
                      d="M0,40 L20,35 L40,45 L60,30 L80,35 L100,25 L120,30 L140,20 L160,25 L180,15 L200,20"
                      fill="none"
                      stroke="var(--color-buy)"
                      stroke-width="2"
                    />
                  </svg>
                </div>
              </A>
            ))}
          </div>
        </section>

        <section class="home--prediction-markets">
          <div class="section-header">
            <h2>Political Prediction Markets</h2>
            <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer" class="view-all">
              View all on Polymarket
            </a>
          </div>
          <PredictionMarkets limit={8} />
        </section>

        <section class="home--featured-issuers">
          <div class="section-header">
            <h2>Featured Issuers</h2>
            <span class="time-range">3 Years</span>
            <A href="/issuers" class="view-all">View all</A>
          </div>
          <div class="issuers-list">
            {issuers.slice(0, 5).map((issuer) => (
              <div class="issuer-item">
                <div class="issuer-badge">{issuer.ticker.split(':')[0][0]}</div>
                <div class="issuer-info">
                  <span class="name">{issuer.name}</span>
                  <span class="ticker">{issuer.ticker}</span>
                </div>
                <div class="issuer-trades">{issuer.trades}</div>
                <div class="issuer-change" classList={{ positive: (issuer.priceChange || 0) > 0 }}>
                  +{issuer.priceChange?.toFixed(2)}%
                </div>
                <div class="sparkline">
                  <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path
                      d={`M0,${30 - (issuer.sparkline?.[0] || 0) / 10} ${issuer.sparkline?.map((v, i) => `L${i * 9},${30 - v / 10}`).join(' ')}`}
                      fill="none"
                      stroke="var(--color-buy)"
                      stroke-width="1.5"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section class="home--newsletter">
          <div class="newsletter-content">
            <h3>Keeping tabs on Capitol Trades?</h3>
            <p>Stay informed with our weekly newsletter and unlock exclusive content, insider tips & webinars!</p>
            <button class="subscribe-btn">Subscribe</button>
          </div>
        </section>
      </div>
    </div>
  );
}
