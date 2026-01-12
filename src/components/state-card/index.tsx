import './style.css';

import type { StateAggregate } from '../../data/states';

type Props = {
  state: StateAggregate;
};

export function StateCard(props: Props) {
  const s = props.state;

  return (
    <article class="state-card" classList={{ [`party--${s.party.toLowerCase()}`]: true }}>
      <div class="state-card--outline">
        <img src={s.outlineUrl} alt="" loading="lazy" />
      </div>
      <h3 class="state-card--name">{s.name}</h3>
      <div class="state-card--stats">
        <div class="stat">
          <span class="stat-value">{s.trades.toLocaleString()}</span>
          <span class="stat-label">Trades</span>
        </div>
        <div class="stat">
          <span class="stat-value">{s.politicians}</span>
          <span class="stat-label">{s.politicians === 1 ? 'Politician' : 'Politicians'}</span>
        </div>
      </div>
    </article>
  );
}
