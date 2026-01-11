import './style.css';

import { Show } from 'solid-js';

import { getTradeLabel, type TradeLabelId } from '../../data/trade-labels';

type TradeLabelBadgeProps = {
  labelId: TradeLabelId;
  size?: 'sm' | 'md';
  onClick?: (labelId: TradeLabelId) => void;
  selected?: boolean;
};

export function TradeLabelBadge(props: TradeLabelBadgeProps) {
  const label = () => getTradeLabel(props.labelId);

  return (
    <Show when={label()}>
      {(l) => (
        <button
          type="button"
          class="trade-label-badge"
          classList={{
            'trade-label-badge--sm': props.size === 'sm',
            'trade-label-badge--md': props.size === 'md' || !props.size,
            'trade-label-badge--clickable': !!props.onClick,
            'trade-label-badge--selected': props.selected,
          }}
          style={{ '--label-color': l().color }}
          onClick={() => props.onClick?.(props.labelId)}
          title={l().description}
        >
          {l().label}
        </button>
      )}
    </Show>
  );
}
