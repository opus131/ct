import './style.css';

import { Show, For, createResource } from 'solid-js';

import {
  fetchPoliticalMarkets,
  fetchMarketsForPolitician,
  getMockPoliticalMarkets,
  getMockMarketsForPolitician,
  formatOdds,
  formatVolume,
  type PolymarketEvent,
} from '../../data/polymarket';

type MarketCardProps = {
  event: PolymarketEvent;
  compact?: boolean;
};

function MarketCard(props: MarketCardProps) {
  const primaryMarket = () => props.event.markets[0];
  const yesPrice = () => primaryMarket()?.outcomes.find((o) => o.name === 'Yes')?.price ?? 0;
  const noPrice = () => primaryMarket()?.outcomes.find((o) => o.name === 'No')?.price ?? 0;

  return (
    <a
      href={props.event.url}
      target="_blank"
      rel="noopener noreferrer"
      class="market-card"
      classList={{ compact: props.compact }}
    >
      <Show when={props.event.image && !props.compact}>
        <img src={props.event.image} alt="" class="market-card--image" loading="lazy" />
      </Show>
      <div class="market-card--content">
        <h4 class="market-card--title">{primaryMarket()?.question || props.event.title}</h4>
        <div class="market-card--odds">
          <div class="odds-bar">
            <div class="odds-yes" style={{ width: `${yesPrice() * 100}%` }}>
              <span class="odds-label">Yes {formatOdds(yesPrice())}</span>
            </div>
            <div class="odds-no" style={{ width: `${noPrice() * 100}%` }}>
              <span class="odds-label">No {formatOdds(noPrice())}</span>
            </div>
          </div>
        </div>
        <div class="market-card--meta">
          <span class="volume">{formatVolume(props.event.volume)} Vol</span>
          <span class="polymarket-badge">Polymarket</span>
        </div>
      </div>
    </a>
  );
}

type PredictionMarketsProps = {
  politicianName?: string;
  limit?: number;
  compact?: boolean;
  title?: string;
};

export function PredictionMarkets(props: PredictionMarketsProps) {
  // Use object as source to ensure fetcher always runs (even when politicianName is undefined)
  const [markets] = createResource(
    () => ({ name: props.politicianName, limit: props.limit || 10 }),
    async (source) => {
      try {
        if (source.name) {
          const results = await fetchMarketsForPolitician(source.name);
          // Fall back to mock data if API returns empty or fails
          return results.length > 0 ? results : getMockMarketsForPolitician(source.name);
        }
        const results = await fetchPoliticalMarkets(source.limit);
        // Fall back to mock data if API returns empty or fails
        return results.length > 0 ? results : getMockPoliticalMarkets(source.limit);
      } catch {
        // CORS or network error - use mock data
        if (source.name) {
          return getMockMarketsForPolitician(source.name);
        }
        return getMockPoliticalMarkets(source.limit);
      }
    }
  );

  return (
    <div class="prediction-markets">
      <Show when={props.title}>
        <h2 class="prediction-markets--title">{props.title}</h2>
      </Show>

      <Show
        when={!markets.loading}
        fallback={
          <div class="prediction-markets--loading">
            <div class="spinner" />
            <span>Loading prediction markets...</span>
          </div>
        }
      >
        <Show
          when={markets()?.length}
          fallback={
            <div class="prediction-markets--empty">
              <p>No active prediction markets found{props.politicianName ? ` for ${props.politicianName}` : ''}.</p>
              <a
                href="https://polymarket.com"
                target="_blank"
                rel="noopener noreferrer"
                class="polymarket-link"
              >
                Browse all markets on Polymarket
              </a>
            </div>
          }
        >
          <div class="prediction-markets--grid" classList={{ compact: props.compact }}>
            <For each={markets()?.slice(0, props.limit || 10)}>
              {(event) => <MarketCard event={event} compact={props.compact} />}
            </For>
          </div>
        </Show>
      </Show>

      <Show when={markets()?.length}>
        <a
          href="https://polymarket.com"
          target="_blank"
          rel="noopener noreferrer"
          class="prediction-markets--more"
        >
          View more on Polymarket
        </a>
      </Show>
    </div>
  );
}
