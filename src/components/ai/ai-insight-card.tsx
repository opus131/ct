import type { JSX } from 'solid-js';
import './ai-insight-card.css';

type Props = {
  children: JSX.Element;
  loading?: boolean;
  error?: string;
};

export function AIInsightCard(props: Props) {
  return (
    <div class="ai-insight-card" classList={{ loading: props.loading, error: !!props.error }}>
      <div class="ai-insight-header">
        <svg class="ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span class="ai-label">AI Insight</span>
      </div>
      <div class="ai-insight-content">
        {props.error ? (
          <span class="error-message">{props.error}</span>
        ) : props.loading ? (
          <div class="loading-skeleton">
            <div class="skeleton-line" />
            <div class="skeleton-line short" />
          </div>
        ) : (
          props.children
        )}
      </div>
    </div>
  );
}
