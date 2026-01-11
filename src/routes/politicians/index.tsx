import './style.css';

import { A } from '@solidjs/router';
import { createSignal, createMemo, createEffect, For, Show } from 'solid-js';

import { StatsRow } from '../../components/stats-row';
import { FilterBar } from '../../components/filter-bar';
import { PoliticianCard } from '../../components/politician-card';
import { TraitBadge } from '../../components/trait-badge';
import { getPoliticians, stats } from '../../data/politicians';
import type { Politician } from '../../data/types';
import { traitCategories, getTraitsByCategory, type TraitId } from '../../data/traits';

const POLITICIANS_PER_PAGE = 24;

export function Politicians() {
  const [selectedTraits, setSelectedTraits] = createSignal<TraitId[]>([]);
  const [showTraitFilter, setShowTraitFilter] = createSignal(true);
  const [currentPage, setCurrentPage] = createSignal(1);

  const toggleTrait = (traitId: TraitId) => {
    setSelectedTraits((prev) =>
      prev.includes(traitId) ? prev.filter((t) => t !== traitId) : [...prev, traitId]
    );
  };

  const clearTraits = () => setSelectedTraits([]);

  const filteredPoliticians = createMemo(() => {
    const allPoliticians = getPoliticians();
    const selected = selectedTraits();
    if (selected.length === 0) return allPoliticians;
    return allPoliticians.filter((p: Politician) => {
      const pTraits = (p.traits || []) as TraitId[];
      return selected.some((t) => pTraits.includes(t));
    });
  });

  // Reset to page 1 when filters change
  createEffect(() => {
    selectedTraits();
    setCurrentPage(1);
  });

  const totalPages = createMemo(() => Math.max(1, Math.ceil(filteredPoliticians().length / POLITICIANS_PER_PAGE)));

  const paginatedPoliticians = createMemo(() => {
    const start = (currentPage() - 1) * POLITICIANS_PER_PAGE;
    return filteredPoliticians().slice(start, start + POLITICIANS_PER_PAGE);
  });

  const goToPage = (page: number) => {
    const total = totalPages();
    if (page >= 1 && page <= total) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const statItems = [
    { value: stats.trades.toLocaleString(), label: 'Trades', icon: 'trades' as const },
    { value: stats.filings.toLocaleString(), label: 'Filings', icon: 'filings' as const },
    { value: stats.volume, label: 'Volume', icon: 'volume' as const },
    { value: stats.politicians, label: 'Politicians', icon: 'politicians' as const },
    { value: stats.issuers.toLocaleString(), label: 'Issuers', icon: 'issuers' as const },
  ];

  return (
    <div class="politicians-page">
      <div class="politicians-page--header">
        <h1>Politicians</h1>
        <span class="time-range">3 Years</span>
      </div>

      <FilterBar
        searchPlaceholder="Find by name"
        secondaryPlaceholder="Find by issuer"
        filters={['Political Party', 'Committee', 'Politician State']}
      />

      <StatsRow stats={statItems} />

      {/* Trait Filter Panel */}
      <div class="trait-filter-panel">
        <div class="trait-filter-header">
          <button
            type="button"
            class="trait-filter-toggle"
            onClick={() => setShowTraitFilter((v) => !v)}
          >
            <span class="icon">{showTraitFilter() ? '▼' : '▶'}</span>
            Filter by Traits
          </button>
          <Show when={selectedTraits().length > 0}>
            <button type="button" class="clear-traits" onClick={clearTraits}>
              Clear ({selectedTraits().length})
            </button>
          </Show>
        </div>
        <Show when={showTraitFilter()}>
          <div class="trait-filter-categories">
            <For each={traitCategories}>
              {(category) => (
                <div class="trait-category">
                  <h4 class="trait-category-label" style={{ color: category.color }}>
                    {category.label}
                  </h4>
                  <div class="trait-category-badges">
                    <For each={getTraitsByCategory(category.id)}>
                      {(trait) => (
                        <TraitBadge
                          traitId={trait.id}
                          size="md"
                          onClick={toggleTrait}
                          selected={selectedTraits().includes(trait.id)}
                        />
                      )}
                    </For>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      <div class="politicians-page--results-header">
        <span class="results-count">
          {filteredPoliticians().length} politician{filteredPoliticians().length !== 1 ? 's' : ''}
        </span>
      </div>

      <div class="politicians-page--grid">
        <For each={paginatedPoliticians()}>
          {(politician) => (
            <A href={`/politicians/${politician.id}`}>
              <PoliticianCard
                politician={politician}
                onTraitClick={toggleTrait}
                selectedTraits={selectedTraits()}
              />
            </A>
          )}
        </For>
      </div>

      <div class="pagination">
        <button
          class="pagination--btn"
          disabled={currentPage() === 1}
          onClick={() => goToPage(1)}
          title="First page"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m11 17-5-5 5-5M18 17l-5-5 5-5" />
          </svg>
        </button>
        <button
          class="pagination--btn"
          disabled={currentPage() === 1}
          onClick={() => goToPage(currentPage() - 1)}
          title="Previous page"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <span class="pagination--info">
          Page <strong>{currentPage()}</strong> of <strong>{totalPages()}</strong>
        </span>
        <button
          class="pagination--btn"
          disabled={currentPage() === totalPages()}
          onClick={() => goToPage(currentPage() + 1)}
          title="Next page"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
        <button
          class="pagination--btn"
          disabled={currentPage() === totalPages()}
          onClick={() => goToPage(totalPages())}
          title="Last page"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m13 17 5-5-5-5M6 17l5-5-5-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
