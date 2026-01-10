import './style.css';

import { A, useParams } from '@solidjs/router';
import { Show, For } from 'solid-js';

import { PoliticianTabs } from '../../components/politician-tabs';
import { PredictionMarkets } from '../../components/prediction-markets';
import { getPoliticianById } from '../../data/politicians';
import { politicianBios, getTeamSlug } from '../../data/politician-bios';

export function PoliticianBio() {
  const params = useParams<{ id: string }>();
  const politician = () => getPoliticianById(params.id);
  const bio = () => politicianBios[params.id];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div class="politician-bio">
      <Show when={politician()} fallback={<div class="not-found">Politician not found</div>}>
        {(p) => (
          <>
            <PoliticianTabs politicianId={p().id} />

            <div class="politician-bio--header">
              <div class="politician-bio--profile">
                <img src={p().photoUrl} alt={p().name} class="politician-bio--photo" />
                <div class="politician-bio--info">
                  <h1>{p().name}</h1>
                  <div class="politician-bio--meta">
                    <span class={`badge badge-${p().party.toLowerCase()}`}>{p().party}</span>
                    <span class="chamber">{p().chamber}</span>
                    <span class="state">{p().state}</span>
                  </div>
                </div>
              </div>
            </div>

            <Show
              when={bio()}
              fallback={
                <div class="no-bio">
                  <p>Biographical information is not yet available for this politician.</p>
                </div>
              }
            >
              {(b) => (
                <div class="politician-bio--content">
                  <section class="bio-section">
                    <h2>Biography</h2>
                    <p class="bio-text">{b().biography}</p>
                  </section>

                  <div class="bio-details-grid">
                    <section class="bio-section bio-section--compact">
                      <h3>Personal Information</h3>
                      <dl class="info-list">
                        <div class="info-item">
                          <dt>Born</dt>
                          <dd>
                            {formatDate(b().birthDate)} (age {calculateAge(b().birthDate)})
                          </dd>
                        </div>
                        <div class="info-item">
                          <dt>Birthplace</dt>
                          <dd>{b().birthPlace}</dd>
                        </div>
                        <div class="info-item">
                          <dt>In Congress Since</dt>
                          <dd>{b().careerStart}</dd>
                        </div>
                      </dl>
                    </section>

                    <section class="bio-section bio-section--compact">
                      <h3>Education</h3>
                      <ul class="education-list">
                        <For each={b().education}>{(edu) => <li>{edu}</li>}</For>
                      </ul>
                    </section>
                  </div>

                  <Show when={b().sportsTeams && b().sportsTeams!.length > 0}>
                    <section class="bio-section">
                      <h2>Sports Affiliations</h2>
                      <div class="sports-teams">
                        <For each={b().sportsTeams}>
                          {(team) => (
                            <A href={`/sports/${getTeamSlug(team)}`} class="sports-team">
                              <img
                                src={team.logoUrl}
                                alt={team.name}
                                class="sports-team--logo"
                                loading="lazy"
                              />
                              <div class="sports-team--info">
                                <span class="sports-team--name">{team.name}</span>
                                <span class="sports-team--league">{team.league}</span>
                              </div>
                            </A>
                          )}
                        </For>
                      </div>
                    </section>
                  </Show>

                  <section class="bio-section">
                    <PredictionMarkets
                      politicianName={p().name}
                      limit={4}
                      title="Prediction Markets"
                    />
                  </section>
                </div>
              )}
            </Show>
          </>
        )}
      </Show>
    </div>
  );
}
