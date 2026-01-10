import { Show, createSignal, onCleanup } from 'solid-js';
import type { JSX } from 'solid-js';

export type TooltipData = {
  x: number;
  y: number;
  content: JSX.Element;
};

const [tooltipData, setTooltipData] = createSignal<TooltipData | null>(null);

export function showTooltip(data: TooltipData) {
  setTooltipData(data);
}

export function hideTooltip() {
  setTooltipData(null);
}

export function ChartTooltip() {
  return (
    <Show when={tooltipData()}>
      {(data) => (
        <div
          class="chart-tooltip"
          style={{
            left: `${data().x + 12}px`,
            top: `${data().y - 12}px`,
          }}
        >
          {data().content}
        </div>
      )}
    </Show>
  );
}

// Hook for easy tooltip management in charts
export function useTooltip(containerRef: () => HTMLDivElement | undefined) {
  const handleMouseMove = (e: MouseEvent, content: JSX.Element) => {
    const container = containerRef();
    if (!container) return;

    const rect = container.getBoundingClientRect();
    showTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      content,
    });
  };

  const handleMouseLeave = () => {
    hideTooltip();
  };

  onCleanup(() => {
    hideTooltip();
  });

  return { handleMouseMove, handleMouseLeave };
}
