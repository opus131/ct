import { createResource } from 'solid-js';
import type { Chamber } from './types';

type RawCommittee = {
  _committeeId: string;
  chamber: string;
  committeeName: string;
  committeeUrl?: string;
  members: Array<{
    _politicianId: string;
    memberRole: string;
    side: string;
  }>;
  stats: {
    countIssuers: number;
    countPoliticians: number;
    countTrades: number;
    dateFirstTraded: string;
    dateLastTraded: string;
    volume: number;
  };
};

export type CommitteeMember = {
  politicianId: string;
  role: string;
  side: string;
};

export type CommitteeAggregate = {
  id: string;
  name: string;
  chamber: Chamber | 'Joint';
  logoUrl: string;
  trades: number;
  politicians: number;
  volume: string;
  members: CommitteeMember[];
  url?: string;
  dateLastTraded?: string;
};

// Map committee IDs to logo filenames
const LOGO_MAP: Record<string, string> = {
  // House
  hlig: 'intelligence',
  hsag: 'agriculture',
  hsap: 'appropriations',
  hsas: 'armed-services',
  hsba: 'financial-services',
  hsbu: 'budget',
  hscn: 'climate-crisis',
  hsed: 'education-labor',
  hsfa: 'foreign-affairs',
  hsfd: 'weaponized-gov',
  hsgo: 'oversight-reform',
  hsha: 'house-administration',
  hshm: 'homeland-security',
  hsif: 'energy-commerce',
  hsii: 'natural-resources',
  hsju: 'judiciary',
  hsmh: 'modernization-congress',
  hspw: 'transportation',
  hsru: 'rules',
  hssm: 'small-business',
  hsso: 'ethics',
  hssy: 'science-space',
  hsvc: 'corona',
  hsvr: 'veterans-affairs',
  hswm: 'ways-means',
  hszs: 'strategy-us-ccp',
  // Senate
  scnc: 'narcotics',
  slet: 'ethics',
  slia: 'indian-affairs',
  slin: 'intelligence',
  spag: 'aging',
  ssaf: 'agriculture-nutrition',
  ssap: 'appropriations',
  ssas: 'armed-services',
  ssbk: 'banking',
  ssbu: 'budget',
  sscm: 'science-space',
  sseg: 'energy-resources',
  ssev: 'environment',
  ssfi: 'ways-means',
  ssfr: 'foreign-affairs',
  ssga: 'homeland-security',
  sshr: 'health',
  ssju: 'judiciary',
  ssra: 'rules',
  sssb: 'small-business',
  ssva: 'veterans-affairs',
  // Joint (use generic icons)
  jcse: 'ethics',
  jsec: 'budget',
  jslc: 'house-administration',
  jspr: 'house-administration',
  jstx: 'ways-means',
};

function mapChamber(chamber: string): Chamber | 'Joint' {
  const c = chamber.toLowerCase();
  if (c === 'senate') return 'Senate';
  if (c === 'house') return 'House';
  return 'Joint';
}

function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) return `$${(volume / 1_000_000_000).toFixed(2)}B`;
  if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(2)}M`;
  if (volume >= 1_000) return `$${(volume / 1_000).toFixed(0)}K`;
  return `$${volume}`;
}

function transformCommittee(raw: RawCommittee): CommitteeAggregate {
  const logoFile = LOGO_MAP[raw._committeeId] || 'ethics';
  return {
    id: raw._committeeId,
    name: raw.committeeName,
    chamber: mapChamber(raw.chamber),
    logoUrl: `/assets/committees/${logoFile}.svg`,
    trades: raw.stats.countTrades,
    politicians: raw.stats.countPoliticians,
    volume: formatVolume(raw.stats.volume),
    members: raw.members.map((m) => ({
      politicianId: m._politicianId,
      role: m.memberRole,
      side: m.side,
    })),
    url: raw.committeeUrl,
    dateLastTraded: raw.stats.dateLastTraded,
  };
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.statusText}`);
  return res.json();
}

const [committeesData] = createResource(async () => {
  const raw = await fetchJson<RawCommittee[]>('/data/committee.full.json');
  return raw
    .map(transformCommittee)
    .filter((c) => c.trades > 0)
    .sort((a, b) => b.trades - a.trades);
});

export const getCommittees = () => committeesData() || [];

export const getSenateCommittees = () =>
  getCommittees().filter((c) => c.chamber === 'Senate');

export const getHouseCommittees = () =>
  getCommittees().filter((c) => c.chamber === 'House');

export const getJointCommittees = () =>
  getCommittees().filter((c) => c.chamber === 'Joint');

export function getCommitteeById(id: string): CommitteeAggregate | undefined {
  return getCommittees().find((c) => c.id === id);
}

export const isCommitteesLoading = () => committeesData.loading;
