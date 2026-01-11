import { createResource, createSignal } from 'solid-js';
import type { Trade, Politician, Issuer, IssuerPerformance, Party, Chamber, OwnerType, TradeType, Stats } from './types';
import type { TraitId } from './traits';

const CAPITOL_TRADES_CDN = 'https://www.capitoltrades.com/assets/politicians';

type RawPolitician = {
  _politicianId: string;
  _stateId: string;
  party: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  fullName: string;
  chamber: string;
  dob: string;
  gender: string;
  stats: {
    countFilings: number;
    countIssuers: number;
    countTrades: number;
    dateFirstTraded: string | null;
    dateLastTraded: string | null;
    volume: number;
  };
};

type RawTransaction = {
  _txId: number;
  _politicianId: string;
  _issuerId: number;
  pubDate: string;
  filingDate: string;
  txDate: string;
  txType: string;
  owner: string;
  chamber: string;
  value: number;
  reportingGap: number;
  price: number | null;
  issuer: {
    issuerName: string;
    issuerTicker: string | null;
  };
  politician: {
    _stateId: string;
    chamber: string;
    firstName: string;
    lastName: string;
    party: string;
  };
};

type RawIssuer = {
  _issuerId: number;
  _stateId?: string;
  issuerName: string;
  issuerTicker: string | null;
  sector?: string;
  country?: string;
  c2iq?: string;
  stats: {
    countPoliticians: number;
    countTrades: number;
    dateFirstTraded: string;
    dateLastTraded: string;
    volume: number;
  };
};

type RawIssuerPerformance = {
  _issuerId: number;
  eodPrices: [string, number][];
  mcap?: number;
  trailing30?: number;
  trailing90?: number;
  trailing365?: number;
  ytd?: number;
};

function mapParty(party: string): Party {
  const p = party.toLowerCase();
  if (p === 'democrat') return 'Democrat';
  if (p === 'republican') return 'Republican';
  return 'Independent';
}

function mapChamber(chamber: string): Chamber {
  return chamber.toLowerCase() === 'senate' ? 'Senate' : 'House';
}

function mapOwner(owner: string): OwnerType {
  const o = owner.toLowerCase();
  if (o === 'self') return 'Self';
  if (o === 'joint') return 'Joint';
  if (o === 'spouse') return 'Spouse';
  if (o === 'dependent') return 'Dependent';
  return 'Undisclosed';
}

function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) return `${(volume / 1_000_000_000).toFixed(2)}B`;
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(2)}M`;
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(0)}K`;
  return volume.toString();
}

function valueToSizeRange(value: number): string {
  if (value <= 1_000) return '$1-1K';
  if (value <= 15_000) return '1K-15K';
  if (value <= 50_000) return '15K-50K';
  if (value <= 100_000) return '50K-100K';
  if (value <= 250_000) return '100K-250K';
  if (value <= 500_000) return '250K-500K';
  if (value <= 1_000_000) return '500K-1M';
  return '1M+';
}

function computeYearsActive(firstTraded: string | null, lastTraded: string | null): string | undefined {
  if (!firstTraded && !lastTraded) return undefined;
  const first = firstTraded ? new Date(firstTraded).getFullYear() : null;
  const last = lastTraded ? new Date(lastTraded).getFullYear() : null;
  if (first && last) {
    return first === last ? `${first}` : `${first} – ${last}`;
  }
  return first ? `${first}` : last ? `${last}` : undefined;
}

function computeTraits(raw: RawPolitician): TraitId[] {
  const traits: TraitId[] = [];
  const { countTrades, countFilings, countIssuers, volume, dateFirstTraded } = raw.stats;

  // Trading behavior traits
  if (countTrades >= 200) traits.push('high-volume');
  if (countTrades >= 50 && countFilings > 0 && countTrades / countFilings >= 3) traits.push('frequent-trader');
  if (volume >= 5_000_000) traits.push('big-positions');

  // Diversity traits based on issuers
  if (countIssuers >= 30) traits.push('tech-heavy'); // placeholder for diverse portfolio

  // Seniority based on first traded date
  if (dateFirstTraded) {
    const firstYear = new Date(dateFirstTraded).getFullYear();
    const yearsActive = new Date().getFullYear() - firstYear;
    if (yearsActive >= 10) traits.push('senior-member');
    else if (yearsActive <= 2) traits.push('freshman');
  }

  // Filing patterns - high filing count relative to trades suggests timely/thorough reporting
  if (countFilings > 0 && countTrades / countFilings < 2) traits.push('timely-filer');

  return traits;
}

function transformPolitician(raw: RawPolitician): Politician {
  const name = raw.nickname
    ? `${raw.nickname} ${raw.lastName}`
    : `${raw.firstName} ${raw.lastName}`;

  return {
    id: raw._politicianId,
    name,
    party: mapParty(raw.party),
    chamber: mapChamber(raw.chamber),
    state: raw._stateId.toUpperCase(),
    photoUrl: `${CAPITOL_TRADES_CDN}/${raw._politicianId.toLowerCase()}.jpg`,
    trades: raw.stats.countTrades,
    filings: raw.stats.countFilings,
    issuers: raw.stats.countIssuers,
    volume: formatVolume(raw.stats.volume),
    lastTraded: raw.stats.dateLastTraded || '',
    firstTraded: raw.stats.dateFirstTraded || undefined,
    yearsActive: computeYearsActive(raw.stats.dateFirstTraded, raw.stats.dateLastTraded),
    dob: raw.dob || undefined,
    gender: raw.gender === 'M' || raw.gender === 'F' ? raw.gender : undefined,
    traits: computeTraits(raw),
  };
}

function transformTransaction(
  raw: RawTransaction,
  politicianMap: Map<string, Politician>,
  issuerSectorMap: Map<string, string>
): Trade {
  const politician = politicianMap.get(raw._politicianId);
  const politicianName = raw.politician.firstName + ' ' + raw.politician.lastName;
  const issuerId = raw._issuerId.toString();

  return {
    id: raw._txId.toString(),
    politician: {
      id: raw._politicianId,
      name: politician?.name || politicianName,
      party: mapParty(raw.politician.party),
      chamber: mapChamber(raw.politician.chamber),
      state: raw.politician._stateId.toUpperCase(),
      photoUrl: `${CAPITOL_TRADES_CDN}/${raw._politicianId.toLowerCase()}.jpg`,
    },
    issuer: {
      id: issuerId,
      name: raw.issuer.issuerName,
      ticker: raw.issuer.issuerTicker || 'N/A',
      sector: issuerSectorMap.get(issuerId),
    },
    publishedAt: raw.pubDate.replace('T', ' ').substring(0, 16),
    tradedAt: raw.txDate,
    filedAfterDays: raw.reportingGap,
    owner: mapOwner(raw.owner),
    type: raw.txType as TradeType,
    sizeRange: valueToSizeRange(raw.value),
    price: raw.price ?? undefined,
  };
}

function transformIssuer(raw: RawIssuer): Issuer {
  return {
    id: raw._issuerId.toString(),
    name: raw.issuerName,
    ticker: raw.issuerTicker || 'N/A',
    sector: raw.sector ? formatSector(raw.sector) : undefined,
    country: raw.country?.toUpperCase(),
    trades: raw.stats.countTrades,
    politicians: raw.stats.countPoliticians,
    volume: formatVolume(raw.stats.volume),
    dateFirstTraded: raw.stats.dateFirstTraded,
    dateLastTraded: raw.stats.dateLastTraded,
  };
}

function formatSector(sector: string): string {
  return sector
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function transformIssuerPerformance(raw: RawIssuerPerformance): IssuerPerformance {
  return {
    issuerId: raw._issuerId.toString(),
    eodPrices: raw.eodPrices,
    mcap: raw.mcap,
    trailing30: raw.trailing30,
    trailing90: raw.trailing90,
    trailing365: raw.trailing365,
    ytd: raw.ytd,
  };
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.statusText}`);
  return res.json();
}

// Data loading resources
const [politiciansData] = createResource(async () => {
  const raw = await fetchJson<RawPolitician[]>('/data/politician.full.json');
  return raw
    .map(transformPolitician)
    .filter((p) => p.trades > 0)
    .sort((a, b) => (b.lastTraded || '').localeCompare(a.lastTraded || ''));
});

const [tradesData] = createResource(async () => {
  const [rawTx, rawPoliticians, rawIssuers] = await Promise.all([
    fetchJson<RawTransaction[]>('/data/transaction.full.json'),
    fetchJson<RawPolitician[]>('/data/politician.full.json'),
    fetchJson<RawIssuer[]>('/data/issuer.full.json'),
  ]);

  const politicianMap = new Map(
    rawPoliticians.map((p) => [p._politicianId, transformPolitician(p)])
  );

  const issuerSectorMap = new Map(
    rawIssuers
      .filter((i) => i.sector)
      .map((i) => [i._issuerId.toString(), i.sector!])
  );

  return rawTx
    .map((tx) => transformTransaction(tx, politicianMap, issuerSectorMap))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
});

const [issuersData] = createResource(async () => {
  const raw = await fetchJson<RawIssuer[]>('/data/issuer.full.json');
  return raw
    .map(transformIssuer)
    .filter((i) => i.trades > 0)
    .sort((a, b) => b.trades - a.trades);
});

// Performance data - loaded once and cached
let performanceDataCache: IssuerPerformance[] | null = null;
const [performanceDataLoading, setPerformanceDataLoading] = createSignal(false);

async function loadPerformanceData(): Promise<IssuerPerformance[]> {
  if (performanceDataCache) return performanceDataCache;

  setPerformanceDataLoading(true);
  try {
    const raw = await fetchJson<RawIssuerPerformance[]>('/data/issuer-performance.full.json');
    performanceDataCache = raw.map(transformIssuerPerformance);
    return performanceDataCache;
  } finally {
    setPerformanceDataLoading(false);
  }
}

// Computed stats
function computeStats(
  politicians: Politician[] | undefined,
  trades: Trade[] | undefined,
  issuers: Issuer[] | undefined
): Stats {
  if (!politicians || !trades || !issuers) {
    return { trades: 0, filings: 0, volume: '$0', politicians: 0, issuers: 0 };
  }

  const totalVolume = politicians.reduce((sum, p) => {
    const vol = p.volume;
    let num = 0;
    if (vol.endsWith('B')) num = parseFloat(vol) * 1_000_000_000;
    else if (vol.endsWith('M')) num = parseFloat(vol) * 1_000_000;
    else if (vol.endsWith('K')) num = parseFloat(vol) * 1_000;
    else num = parseFloat(vol) || 0;
    return sum + num;
  }, 0);

  const totalFilings = politicians.reduce((sum, p) => sum + p.filings, 0);

  return {
    trades: trades.length,
    filings: totalFilings,
    volume: '$' + formatVolume(totalVolume),
    politicians: politicians.length,
    issuers: issuers.length,
  };
}

// Export reactive accessors
export const getPoliticians = () => politiciansData() || [];
export const getTrades = () => tradesData() || [];
export const getIssuers = () => issuersData() || [];
export const getStats = () => computeStats(politiciansData(), tradesData(), issuersData());

export function getPoliticianById(id: string): Politician | undefined {
  return getPoliticians().find((p) => p.id === id);
}

export function getTradesForPolitician(politicianId: string): Trade[] {
  return getTrades().filter((t) => t.politician.id === politicianId);
}

export function getIssuerById(id: string): Issuer | undefined {
  return getIssuers().find((i) => i.id === id);
}

export function getTradesForIssuer(issuerId: string): Trade[] {
  return getTrades().filter((t) => t.issuer.id === issuerId);
}

export async function getIssuerPerformance(issuerId: string): Promise<IssuerPerformance | undefined> {
  const data = await loadPerformanceData();
  return data.find((p) => p.issuerId === issuerId);
}

export function getAllSectors(): string[] {
  const sectors = new Set<string>();
  getIssuers().forEach((i) => {
    if (i.sector) sectors.add(i.sector);
  });
  return Array.from(sectors).sort();
}

export const isPerformanceLoading = () => performanceDataLoading();

// S&P 500 benchmark data (special issuer ID 111111)
const SP500_ISSUER_ID = '111111';
let sp500DataCache: IssuerPerformance | null = null;

async function loadSP500Data(): Promise<IssuerPerformance | null> {
  if (sp500DataCache) return sp500DataCache;

  try {
    const raw = await fetchJson<RawIssuerPerformance[]>('/data/special-price.full.json');
    const sp500Raw = raw.find((p) => p._issuerId.toString() === SP500_ISSUER_ID);
    if (sp500Raw) {
      sp500DataCache = transformIssuerPerformance(sp500Raw);
    }
    return sp500DataCache;
  } catch (e) {
    console.error('Failed to load S&P 500 data:', e);
    return null;
  }
}

export async function getSP500Performance(): Promise<IssuerPerformance | null> {
  return loadSP500Data();
}

// Loading states
export const isPoliticiansLoading = () => politiciansData.loading;
export const isTradesLoading = () => tradesData.loading;
export const isIssuersLoading = () => issuersData.loading;
export const isLoading = () => politiciansData.loading || tradesData.loading || issuersData.loading;
