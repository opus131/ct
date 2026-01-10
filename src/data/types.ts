export type Party = 'Democrat' | 'Republican' | 'Independent';
export type Chamber = 'House' | 'Senate';
export type TradeType = 'buy' | 'sell';
export type OwnerType = 'Self' | 'Joint' | 'Spouse' | 'Dependent' | 'Undisclosed';
export type SportsLeague = 'NFL' | 'MLB' | 'NBA' | 'NHL' | 'NCAA' | 'MLS';

export type SportsTeam = {
  name: string;
  league: SportsLeague;
  logoUrl: string;
};

export type Politician = {
  id: string;
  name: string;
  party: Party;
  chamber: Chamber;
  state: string;
  photoUrl: string;
  trades: number;
  filings: number;
  issuers: number;
  volume: string;
  lastTraded: string;
  traits?: string[];
  biography?: string;
  birthDate?: string;
  birthPlace?: string;
  education?: string[];
  careerStart?: number;
  sportsTeams?: SportsTeam[];
};

export type Issuer = {
  id: string;
  name: string;
  ticker: string;
  logoUrl?: string;
  sector?: string;
  trades: number;
  politicians: number;
  volume: string;
  price?: number;
  priceChange?: number;
  sparkline?: number[];
};

export type Trade = {
  id: string;
  politician: {
    id: string;
    name: string;
    party: Party;
    chamber: Chamber;
    state: string;
    photoUrl: string;
  };
  issuer: {
    id: string;
    name: string;
    ticker: string;
    logoUrl?: string;
  };
  publishedAt: string;
  tradedAt: string;
  filedAfterDays: number;
  owner: OwnerType;
  type: TradeType;
  sizeRange: string;
  price?: number;
};

export type Stats = {
  trades: number;
  filings: number;
  volume: string;
  politicians: number;
  issuers: number;
};
