// Politician Trait System

export type TraitCategory =
  | 'trading-behavior'
  | 'committee-influence'
  | 'disclosure-patterns'
  | 'investment-focus'
  | 'political-position'
  | 'background'
  | 'trading-patterns';

export type TraitId =
  // Trading Behavior
  | 'high-volume'
  | 'frequent-trader'
  | 'big-positions'
  | 'options-active'
  | 'day-trader'
  // Committee Influence
  | 'finance-oversight'
  | 'tech-oversight'
  | 'defense-access'
  | 'energy-access'
  | 'healthcare-access'
  // Disclosure Patterns
  | 'late-filer'
  | 'timely-filer'
  | 'amendment-heavy'
  | 'spouse-trades'
  // Investment Focus
  | 'tech-heavy'
  | 'defense-stocks'
  | 'pharma-focus'
  | 'energy-sector'
  | 'financials'
  // Political Position
  | 'committee-chair'
  | 'ranking-member'
  | 'party-leadership'
  | 'freshman'
  | 'senior-member'
  // Background
  | 'business-executive'
  | 'legal-background'
  | 'military-veteran'
  // Trading Patterns
  | 'pre-vote-trades'
  | 'contrarian'
  | 'index-follower';

export type Trait = {
  id: TraitId;
  label: string;
  description: string;
  category: TraitCategory;
  color: string;
};

export type TraitCategoryInfo = {
  id: TraitCategory;
  label: string;
  color: string;
};

export const traitCategories: TraitCategoryInfo[] = [
  { id: 'trading-behavior', label: 'Trading Behavior', color: '#f59e0b' },
  { id: 'committee-influence', label: 'Committee Influence', color: '#8b5cf6' },
  { id: 'disclosure-patterns', label: 'Disclosure Patterns', color: '#ec4899' },
  { id: 'investment-focus', label: 'Investment Focus', color: '#06b6d4' },
  { id: 'political-position', label: 'Political Position', color: '#10b981' },
  { id: 'background', label: 'Background', color: '#6366f1' },
  { id: 'trading-patterns', label: 'Trading Patterns', color: '#f97316' },
];

export const traits: Record<TraitId, Trait> = {
  // Trading Behavior
  'high-volume': {
    id: 'high-volume',
    label: 'High Volume',
    description: 'Exceptionally high number of trades',
    category: 'trading-behavior',
    color: '#f59e0b',
  },
  'frequent-trader': {
    id: 'frequent-trader',
    label: 'Frequent Trader',
    description: 'Trades more often than peers',
    category: 'trading-behavior',
    color: '#f59e0b',
  },
  'big-positions': {
    id: 'big-positions',
    label: 'Big Positions',
    description: 'Takes large individual positions',
    category: 'trading-behavior',
    color: '#f59e0b',
  },
  'options-active': {
    id: 'options-active',
    label: 'Options Active',
    description: 'Actively trades options/derivatives',
    category: 'trading-behavior',
    color: '#f59e0b',
  },
  'day-trader': {
    id: 'day-trader',
    label: 'Day Trader',
    description: 'Multiple trades on same securities',
    category: 'trading-behavior',
    color: '#f59e0b',
  },

  // Committee Influence
  'finance-oversight': {
    id: 'finance-oversight',
    label: 'Finance Oversight',
    description: 'Serves on financial services committee',
    category: 'committee-influence',
    color: '#8b5cf6',
  },
  'tech-oversight': {
    id: 'tech-oversight',
    label: 'Tech Oversight',
    description: 'Serves on tech/commerce committee',
    category: 'committee-influence',
    color: '#8b5cf6',
  },
  'defense-access': {
    id: 'defense-access',
    label: 'Defense Access',
    description: 'Armed services or intelligence committee',
    category: 'committee-influence',
    color: '#8b5cf6',
  },
  'energy-access': {
    id: 'energy-access',
    label: 'Energy Access',
    description: 'Energy & natural resources committee',
    category: 'committee-influence',
    color: '#8b5cf6',
  },
  'healthcare-access': {
    id: 'healthcare-access',
    label: 'Healthcare Access',
    description: 'Health committee or subcommittee',
    category: 'committee-influence',
    color: '#8b5cf6',
  },

  // Disclosure Patterns
  'late-filer': {
    id: 'late-filer',
    label: 'Late Filer',
    description: 'Frequently files after deadline',
    category: 'disclosure-patterns',
    color: '#ec4899',
  },
  'timely-filer': {
    id: 'timely-filer',
    label: 'Timely Filer',
    description: 'Consistently files on time',
    category: 'disclosure-patterns',
    color: '#ec4899',
  },
  'amendment-heavy': {
    id: 'amendment-heavy',
    label: 'Amendment Heavy',
    description: 'Frequently amends past filings',
    category: 'disclosure-patterns',
    color: '#ec4899',
  },
  'spouse-trades': {
    id: 'spouse-trades',
    label: 'Spouse Trades',
    description: 'Significant spousal trading activity',
    category: 'disclosure-patterns',
    color: '#ec4899',
  },

  // Investment Focus
  'tech-heavy': {
    id: 'tech-heavy',
    label: 'Tech Heavy',
    description: 'Portfolio concentrated in technology',
    category: 'investment-focus',
    color: '#06b6d4',
  },
  'defense-stocks': {
    id: 'defense-stocks',
    label: 'Defense Stocks',
    description: 'Significant defense holdings',
    category: 'investment-focus',
    color: '#06b6d4',
  },
  'pharma-focus': {
    id: 'pharma-focus',
    label: 'Pharma Focus',
    description: 'Healthcare/pharmaceutical focus',
    category: 'investment-focus',
    color: '#06b6d4',
  },
  'energy-sector': {
    id: 'energy-sector',
    label: 'Energy Sector',
    description: 'Oil, gas, renewables focus',
    category: 'investment-focus',
    color: '#06b6d4',
  },
  'financials': {
    id: 'financials',
    label: 'Financials',
    description: 'Banks, insurance, fintech focus',
    category: 'investment-focus',
    color: '#06b6d4',
  },

  // Political Position
  'committee-chair': {
    id: 'committee-chair',
    label: 'Committee Chair',
    description: 'Chairs a committee',
    category: 'political-position',
    color: '#10b981',
  },
  'ranking-member': {
    id: 'ranking-member',
    label: 'Ranking Member',
    description: 'Ranking minority member',
    category: 'political-position',
    color: '#10b981',
  },
  'party-leadership': {
    id: 'party-leadership',
    label: 'Party Leadership',
    description: 'Holds party leadership role',
    category: 'political-position',
    color: '#10b981',
  },
  'freshman': {
    id: 'freshman',
    label: 'Freshman',
    description: 'First term in current chamber',
    category: 'political-position',
    color: '#10b981',
  },
  'senior-member': {
    id: 'senior-member',
    label: 'Senior Member',
    description: '10+ years in Congress',
    category: 'political-position',
    color: '#10b981',
  },

  // Background
  'business-executive': {
    id: 'business-executive',
    label: 'Business Executive',
    description: 'Former corporate executive',
    category: 'background',
    color: '#6366f1',
  },
  'legal-background': {
    id: 'legal-background',
    label: 'Legal Background',
    description: 'Attorney or legal career',
    category: 'background',
    color: '#6366f1',
  },
  'military-veteran': {
    id: 'military-veteran',
    label: 'Military Veteran',
    description: 'Former military service',
    category: 'background',
    color: '#6366f1',
  },

  // Trading Patterns
  'pre-vote-trades': {
    id: 'pre-vote-trades',
    label: 'Pre-Vote Trades',
    description: 'Trades before relevant legislation',
    category: 'trading-patterns',
    color: '#f97316',
  },
  'contrarian': {
    id: 'contrarian',
    label: 'Contrarian',
    description: 'Trades against market sentiment',
    category: 'trading-patterns',
    color: '#f97316',
  },
  'index-follower': {
    id: 'index-follower',
    label: 'Index Follower',
    description: 'Primarily passive/index investments',
    category: 'trading-patterns',
    color: '#f97316',
  },
};

// Helper to get trait by ID
export function getTrait(id: TraitId): Trait {
  return traits[id];
}

// Helper to get traits by category
export function getTraitsByCategory(category: TraitCategory): Trait[] {
  return Object.values(traits).filter((t) => t.category === category);
}

// Helper to get all traits as array
export function getAllTraits(): Trait[] {
  return Object.values(traits);
}

// Helper to get category info
export function getCategoryInfo(category: TraitCategory): TraitCategoryInfo | undefined {
  return traitCategories.find((c) => c.id === category);
}

// Helper to get traits grouped by category
export function getTraitsGroupedByCategory(): Map<TraitCategory, Trait[]> {
  const grouped = new Map<TraitCategory, Trait[]>();
  for (const category of traitCategories) {
    grouped.set(category.id, getTraitsByCategory(category.id));
  }
  return grouped;
}
