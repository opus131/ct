import './style.css';

import { Show } from 'solid-js';

import { getTrait, type TraitId } from '../../data/traits';

type TraitBadgeProps = {
  traitId: TraitId;
  size?: 'sm' | 'md';
  onClick?: (traitId: TraitId) => void;
  selected?: boolean;
};

export function TraitBadge(props: TraitBadgeProps) {
  const trait = () => getTrait(props.traitId);

  return (
    <Show when={trait()}>
      {(t) => (
        <button
          type="button"
          class="trait-badge"
          classList={{
            'trait-badge--sm': props.size === 'sm',
            'trait-badge--md': props.size === 'md' || !props.size,
            'trait-badge--clickable': !!props.onClick,
            'trait-badge--selected': props.selected,
          }}
          style={{ '--trait-color': t().color }}
          onClick={() => props.onClick?.(props.traitId)}
          title={t().description}
        >
          {t().label}
        </button>
      )}
    </Show>
  );
}
