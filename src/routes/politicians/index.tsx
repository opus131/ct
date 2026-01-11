import './style.css';

import { A } from '@solidjs/router';
import { createSignal, createMemo, For, Show } from 'solid-js';

import { StatsRow } from '../../components/stats-row';
import { FilterBar } from '../../components/filter-bar';
import { PoliticianCard } from '../../components/politician-card';
import { TraitBadge } from '../../components/trait-badge';
import { getPoliticians, stats } from '../../data/politicians';
import type { Politician } from '../../data/types';
import { traitCategories, getTraitsByCategory, type TraitId } from '../../data/traits';

export function Politicians() {
  const [selectedTraits, setSelectedTraits] = createSignal<TraitId[]>([]);
  const [showTraitFilter, setShowTraitFilter] = createSignal(true);

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
        <For each={filteredPoliticians()}>
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
    </div>
  );
}
