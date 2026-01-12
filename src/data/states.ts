import { createResource } from 'solid-js';
import type { Party } from './types';

type RawState = {
  _stateId: string;
  stateName: string;
  stateCapital: string;
  senateComposition: string;
  stats: {
    countIssuers: number;
    countPoliticians: number;
    countTrades: number;
    dateFirstTraded: string | null;
    dateLastTraded: string | null;
    volume: number;
  };
};

export type StateAggregate = {
  id: string;
  name: string;
  capital: string;
  senateComposition: string;
  party: Party;
  outlineUrl: string;
  trades: number;
  politicians: number;
  issuers: number;
  volume: string;
  dateFirstTraded: string | null;
  dateLastTraded: string | null;
};

function deriveParty(composition: string): Party {
  if (composition === 'd_d') return 'Democrat';
  if (composition === 'r_r') return 'Republican';
  return 'Independent';
}

function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) return `$${(volume / 1_000_000_000).toFixed(2)}B`;
  if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(2)}M`;
  if (volume >= 1_000) return `$${(volume / 1_000).toFixed(0)}K`;
  return `$${volume}`;
}

function transformState(raw: RawState): StateAggregate {
  return {
    id: raw._stateId,
    name: raw.stateName,
    capital: raw.stateCapital,
    senateComposition: raw.senateComposition,
    party: deriveParty(raw.senateComposition),
    outlineUrl: `/assets/states/${raw._stateId}.svg`,
    trades: raw.stats.countTrades,
    politicians: raw.stats.countPoliticians,
    issuers: raw.stats.countIssuers,
    volume: formatVolume(raw.stats.volume),
    dateFirstTraded: raw.stats.dateFirstTraded,
    dateLastTraded: raw.stats.dateLastTraded,
  };
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.statusText}`);
  return res.json();
}

const [statesData] = createResource(async () => {
  const raw = await fetchJson<RawState[]>('/data/state.full.json');
  return raw.map(transformState).sort((a, b) => a.name.localeCompare(b.name));
});

export const getStates = () => statesData() || [];

export const getStatesSortedByTrades = () =>
  [...getStates()].sort((a, b) => b.trades - a.trades);

export const getStatesSortedByPoliticians = () =>
  [...getStates()].sort((a, b) => b.politicians - a.politicians);

export function getStateById(id: string): StateAggregate | undefined {
  return getStates().find((s) => s.id === id.toLowerCase());
}

export const isStatesLoading = () => statesData.loading;
