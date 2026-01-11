import './style.css';

import { Show } from 'solid-js';
import type { Issuer } from '../../data/types';

type Props = {
  issuer: Issuer;
};

export function IssuerCard(props: Props) {
  const i = props.issuer;

  const tickerInitial = () => {
    if (i.ticker && i.ticker !== 'N/A') {
      return i.ticker.split(':')[0].charAt(0).toUpperCase();
    }
    return i.name.charAt(0).toUpperCase();
  };

  const sectorClass = () => {
    if (!i.sector) return '';
    return i.sector.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <article class={`issuer-card sector--${sectorClass()}`}>
      <div class="issuer-card--badge">
        <span class="badge-letter">{tickerInitial()}</span>
      </div>
      <div class="issuer-card--info">
        <h3 class="issuer-card--name">{i.name}</h3>
        <div class="issuer-card--meta">
          <span class="ticker">{i.ticker}</span>
          <Show when={i.sector}>
            <span class="sector-badge">{i.sector}</span>
          </Show>
        </div>
      </div>
      <div class="issuer-card--stats">
        <div class="stat">
          <span class="stat-value">{i.trades.toLocaleString()}</span>
          <span class="stat-label">Trades</span>
        </div>
        <div class="stat">
          <span class="stat-value">{i.politicians}</span>
          <span class="stat-label">Politicians</span>
        </div>
        <div class="stat">
          <span class="stat-value">{i.volume}</span>
          <span class="stat-label">Volume</span>
        </div>
        <div class="stat">
          <span class="stat-value">{i.dateLastTraded || '-'}</span>
          <span class="stat-label">Last Traded</span>
        </div>
      </div>
    </article>
  );
}
