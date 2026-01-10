import { createSignal, Show } from 'solid-js';
import type { Trade } from '../../data/types';
import { generateTradeInsight } from '../../lib/gemini/client';
import { AIInsightCard } from './ai-insight-card';
import './trade-tooltip.css';

type Props = {
  trade: Trade;
};

export function TradeTooltip(props: Props) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [insight, setInsight] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  let tooltipRef: HTMLDivElement | undefined;
  let buttonRef: HTMLButtonElement | undefined;

  const fetchInsight = async () => {
    if (insight() || loading()) return;

    setLoading(true);
    setError(null);

    try {
      await generateTradeInsight(props.trade, (text) => {
        setInsight(text);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insight');
    } finally {
      setLoading(false);
    }
  };

  const toggleTooltip = () => {
    const newState = !isOpen();
    setIsOpen(newState);
    if (newState) {
      fetchInsight();
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      tooltipRef &&
      buttonRef &&
      !tooltipRef.contains(e.target as Node) &&
      !buttonRef.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  // Add/remove click listener when tooltip opens/closes
  const setupClickOutside = () => {
    if (isOpen()) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
  };

  return (
    <div class="trade-tooltip-container">
      <button
        ref={buttonRef}
        class="ai-insight-btn"
        onClick={(e) => {
          e.stopPropagation();
          toggleTooltip();
          setupClickOutside();
        }}
        title="AI Insight"
        aria-label="Get AI insight for this trade"
        aria-expanded={isOpen()}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </button>

      <Show when={isOpen()}>
        <div ref={tooltipRef} class="trade-tooltip-popover">
          <AIInsightCard loading={loading()} error={error() || undefined}>
            <p>{insight()}</p>
          </AIInsightCard>
        </div>
      </Show>
    </div>
  );
}
