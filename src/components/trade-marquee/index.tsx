import './style.css';

import { For, createMemo } from 'solid-js';
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
  issuerLogoUrl: string;
  politicianPhotoUrl: string;
  size: string;
  type: 'buy' | 'sell';
}) {
  return (
    <A href="/trades" class="marquee-item">
      <img src={props.politicianPhotoUrl} alt="" class="marquee-politician" />
      <img src={props.issuerLogoUrl} alt="" class="marquee-logo" />
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
  // Only include trades where the issuer has a logo
  const trades = createMemo(() =>
    getTrades()
      .filter((t) => t.issuer.logoUrl)
      .slice(0, 30)
  );

  return (
    <div class="trade-marquee">
      <div class="trade-marquee--track">
        <div class="trade-marquee--content">
          <For each={trades()}>
            {(trade) => (
              <MarqueeItem
                ticker={trade.issuer.ticker}
                issuerLogoUrl={trade.issuer.logoUrl!}
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
                issuerLogoUrl={trade.issuer.logoUrl!}
                politicianPhotoUrl={trade.politician.photoUrl}
                size={trade.sizeRange}
                type={trade.type}
              />
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
