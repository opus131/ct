import './style.css';

import type { CommitteeAggregate } from '../../data/committees';

type Props = {
  committee: CommitteeAggregate;
};

export function CommitteeCard(props: Props) {
  const c = props.committee;

  return (
    <article class="committee-card">
      <div class="committee-card--logo">
        <img src={c.logoUrl} alt="" loading="lazy" />
      </div>
      <h3 class="committee-card--name">{c.name}</h3>
      <div class="committee-card--stats">
        <div class="stat">
          <span class="stat-value">{c.trades.toLocaleString()}</span>
          <span class="stat-label">Trades</span>
        </div>
        <div class="stat">
          <span class="stat-value">{c.politicians}</span>
          <span class="stat-label">{c.politicians === 1 ? 'Politician' : 'Politicians'}</span>
        </div>
      </div>
    </article>
  );
}
