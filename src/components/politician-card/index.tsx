import './style.css';

import { Show, For, createMemo } from 'solid-js';

import { TraitBadge } from '../trait-badge';
import type { TraitId } from '../../data/traits';
import type { Politician } from '../../data/types';

type Props = {
  politician: Politician;
  maxTraits?: number;
  onTraitClick?: (traitId: TraitId) => void;
  selectedTraits?: TraitId[];
};

export function PoliticianCard(props: Props) {
  const p = props.politician;
  const partyClass = p.party.toLowerCase();

  const displayedTraits = createMemo(() => {
    const traits = (p.traits || []) as TraitId[];
    const max = props.maxTraits ?? 4;
    return traits.slice(0, max);
  });

  const remainingCount = createMemo(() => {
    const traits = (p.traits || []) as TraitId[];
    const max = props.maxTraits ?? 4;
    return Math.max(0, traits.length - max);
  });

  return (
    <article class={`politician-card party--${partyClass}`}>
      <div class="politician-card--avatar">
        <img src={p.photoUrl} alt={p.name} loading="lazy" />
      </div>
      <div class="politician-card--info">
        <h3 class="politician-card--name">{p.name}</h3>
        <div class="politician-card--affiliation">
          <span class={`party-badge party-badge--${partyClass}`}>
            {p.party === 'Democrat' ? 'D' : 'R'}
          </span>
          <span class="chamber">{p.chamber}</span>
          <span class="state">{p.state}</span>
        </div>
      </div>
      <Show when={displayedTraits().length > 0}>
        <div class="politician-card--traits">
          <For each={displayedTraits()}>
            {(traitId) => (
              <TraitBadge
                traitId={traitId}
                size="sm"
                onClick={props.onTraitClick}
                selected={props.selectedTraits?.includes(traitId)}
              />
            )}
          </For>
          <Show when={remainingCount() > 0}>
            <span class="trait-overflow">+{remainingCount()}</span>
          </Show>
        </div>
      </Show>
      <div class="politician-card--stats">
        <div class="stat">
          <span class="stat-value">{p.trades}</span>
          <span class="stat-label">Trades</span>
        </div>
        <div class="stat">
          <span class="stat-value">{p.issuers}</span>
          <span class="stat-label">Issuers</span>
        </div>
        <div class="stat">
          <span class="stat-value">{p.volume}</span>
          <span class="stat-label">Volume</span>
        </div>
        <div class="stat">
          <span class="stat-value">{p.lastTraded}</span>
          <span class="stat-label">Last Traded</span>
        </div>
      </div>
    </article>
  );
}
