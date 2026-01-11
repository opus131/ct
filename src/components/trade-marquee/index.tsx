import './style.css';

import { For, Show, createMemo } from 'solid-js';
import { A } from '@solidjs/router';

import { getTrades } from '../../data/data-service';

function formatSize(sizeRange: string): string {
  // Convert "1M+" to "$1M+", "100K-250K" to "$250K", etc.
  if (sizeRange === '1M+') return '$1M+';
  if (sizeRange.includes('-')) {
    const parts = sizeRange.split('-');
    return '$' + parts[1];
  }
  return '$' + sizeRange;
}

function MarqueeItem(props: {
  ticker: string;
  politicianPhotoUrl: string;
  size: string;
  type: 'buy' | 'sell';
}) {
  return (
    <A href="/trades" class="marquee-item">
      <img src={props.politicianPhotoUrl} alt="" class="marquee-politician" />
      <span
        class="marquee-ticker"
        classList={{ buy: props.type === 'buy', sell: props.type === 'sell' }}
      >
        {props.ticker}
      </span>
      <span class="marquee-size">{formatSize(props.size)}</span>
      <span
        class="marquee-type"
        classList={{ buy: props.type === 'buy', sell: props.type === 'sell' }}
      >
        {props.type === 'buy' ? 'Buy' : 'Sell'}
      </span>
    </A>
  );
}

export function TradeMarquee() {
  // One trade per politician, most recent first
  const trades = createMemo(() => {
    const seen = new Set<string>();
    return getTrades()
      .filter((t) => {
        if (seen.has(t.politician.id)) return false;
        seen.add(t.politician.id);
        return true;
      })
      .slice(0, 20);
  });

  return (
    <Show when={trades().length > 0}>
      <div class="trade-marquee">
        <div class="trade-marquee--track" style={{ animation: 'marquee-scroll 40s linear infinite' }}>
          <div class="trade-marquee--content">
            <For each={trades()}>
              {(trade) => (
                <MarqueeItem
                  ticker={trade.issuer.ticker}
                  politicianPhotoUrl={trade.politician.photoUrl}
                  size={trade.sizeRange}
                  type={trade.type}
                />
              )}
            </For>
          </div>
          <div class="trade-marquee--content" aria-hidden="true">
            <For each={trades()}>
              {(trade) => (
                <MarqueeItem
                  ticker={trade.issuer.ticker}
                  politicianPhotoUrl={trade.politician.photoUrl}
                  size={trade.sizeRange}
                  type={trade.type}
                />
              )}
            </For>
          </div>
        </div>
      </div>
    </Show>
  );
}
