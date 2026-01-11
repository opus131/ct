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

export type SocialLinks = {
  website?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
};

export type Tenure = {
  congressId: string;
  chamber: Chamber;
  startDate: string;
  endDate: string;
};

export type Committee = {
  name: string;
  rank?: number;
};

export type Politician = {
  id: string;
  name: string;
  party: Party;
  chamber: Chamber;
  state: string;
  district?: string;
  photoUrl: string;
  trades: number;
  filings: number;
  issuers: number;
  volume: string;
  lastTraded: string;
  firstTraded?: string;
  yearsActive?: string;
  dob?: string;
  gender?: 'M' | 'F';
  socialLinks?: SocialLinks;
  tenure?: Tenure[];
  committees?: Committee[];
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
  country?: string;
  trades: number;
  politicians: number;
  volume: string;
  dateFirstTraded?: string;
  dateLastTraded?: string;
  price?: number;
  priceChange?: number;
  sparkline?: number[];
};

export type IssuerPerformance = {
  issuerId: string;
  eodPrices: [string, number][];
  mcap?: number;
  trailing30?: number;
  trailing90?: number;
  trailing365?: number;
  ytd?: number;
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
    sector?: string;
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
