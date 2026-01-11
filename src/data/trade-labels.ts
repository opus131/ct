// Trade Label System

export type TradeLabelCategory =
  | 'size'
  | 'timing'
  | 'disclosure'
  | 'context'
  | 'ownership';

export type TradeLabelId =
  // Size
  | 'whale-trade'
  | 'large-position'
  | 'small-position'
  | 'micro-trade'
  // Timing
  | 'quick-flip'
  | 'long-hold'
  | 'pre-earnings'
  | 'post-earnings'
  | 'market-hours'
  // Disclosure
  | 'late-disclosure'
  | 'very-late'
  | 'timely'
  | 'same-day'
  // Context
  | 'sector-relevant'
  | 'committee-related'
  | 'legislation-adjacent'
  | 'contrarian-move'
  | 'momentum-trade'
  // Ownership
  | 'spouse-trade'
  | 'dependent-trade'
  | 'joint-account';

export type TradeLabel = {
  id: TradeLabelId;
  label: string;
  description: string;
  category: TradeLabelCategory;
  color: string;
};

export type TradeLabelCategoryInfo = {
  id: TradeLabelCategory;
  label: string;
  color: string;
};

export const tradeLabelCategories: TradeLabelCategoryInfo[] = [
  { id: 'size', label: 'Trade Size', color: '#10b981' },
  { id: 'timing', label: 'Timing', color: '#8b5cf6' },
  { id: 'disclosure', label: 'Disclosure', color: '#f59e0b' },
  { id: 'context', label: 'Context', color: '#06b6d4' },
  { id: 'ownership', label: 'Ownership', color: '#ec4899' },
];

export const tradeLabels: Record<TradeLabelId, TradeLabel> = {
  // Size
  'whale-trade': {
    id: 'whale-trade',
    label: 'Whale Trade',
    description: 'Trade exceeds $1M in value',
    category: 'size',
    color: '#10b981',
  },
  'large-position': {
    id: 'large-position',
    label: 'Large Position',
    description: 'Trade between $250K-$1M',
    category: 'size',
    color: '#10b981',
  },
  'small-position': {
    id: 'small-position',
    label: 'Small Position',
    description: 'Trade between $15K-$50K',
    category: 'size',
    color: '#10b981',
  },
  'micro-trade': {
    id: 'micro-trade',
    label: 'Micro Trade',
    description: 'Trade under $15K',
    category: 'size',
    color: '#10b981',
  },

  // Timing
  'quick-flip': {
    id: 'quick-flip',
    label: 'Quick Flip',
    description: 'Sold within 30 days of purchase',
    category: 'timing',
    color: '#8b5cf6',
  },
  'long-hold': {
    id: 'long-hold',
    label: 'Long Hold',
    description: 'Position held over 1 year',
    category: 'timing',
    color: '#8b5cf6',
  },
  'pre-earnings': {
    id: 'pre-earnings',
    label: 'Pre-Earnings',
    description: 'Traded within 14 days before earnings',
    category: 'timing',
    color: '#8b5cf6',
  },
  'post-earnings': {
    id: 'post-earnings',
    label: 'Post-Earnings',
    description: 'Traded within 7 days after earnings',
    category: 'timing',
    color: '#8b5cf6',
  },
  'market-hours': {
    id: 'market-hours',
    label: 'Market Hours',
    description: 'Executed during regular trading hours',
    category: 'timing',
    color: '#8b5cf6',
  },

  // Disclosure
  'late-disclosure': {
    id: 'late-disclosure',
    label: 'Late Disclosure',
    description: 'Filed 30-45 days after trade',
    category: 'disclosure',
    color: '#f59e0b',
  },
  'very-late': {
    id: 'very-late',
    label: 'Very Late',
    description: 'Filed more than 45 days after trade',
    category: 'disclosure',
    color: '#ef4444',
  },
  timely: {
    id: 'timely',
    label: 'Timely',
    description: 'Filed within required 30-day window',
    category: 'disclosure',
    color: '#10b981',
  },
  'same-day': {
    id: 'same-day',
    label: 'Same Day',
    description: 'Filed on the same day as trade',
    category: 'disclosure',
    color: '#06b6d4',
  },

  // Context
  'sector-relevant': {
    id: 'sector-relevant',
    label: 'Sector Relevant',
    description: "Stock sector aligns with politician's committee",
    category: 'context',
    color: '#06b6d4',
  },
  'committee-related': {
    id: 'committee-related',
    label: 'Committee Related',
    description: 'Issuer falls under committee oversight',
    category: 'context',
    color: '#06b6d4',
  },
  'legislation-adjacent': {
    id: 'legislation-adjacent',
    label: 'Legislation Adjacent',
    description: 'Trade near relevant bill vote',
    category: 'context',
    color: '#f97316',
  },
  'contrarian-move': {
    id: 'contrarian-move',
    label: 'Contrarian',
    description: 'Trade against recent market trend',
    category: 'context',
    color: '#06b6d4',
  },
  'momentum-trade': {
    id: 'momentum-trade',
    label: 'Momentum',
    description: 'Trade follows market momentum',
    category: 'context',
    color: '#06b6d4',
  },

  // Ownership
  'spouse-trade': {
    id: 'spouse-trade',
    label: 'Spouse Trade',
    description: 'Trade executed by spouse',
    category: 'ownership',
    color: '#ec4899',
  },
  'dependent-trade': {
    id: 'dependent-trade',
    label: 'Dependent Trade',
    description: 'Trade executed by dependent',
    category: 'ownership',
    color: '#ec4899',
  },
  'joint-account': {
    id: 'joint-account',
    label: 'Joint Account',
    description: 'Trade from joint account',
    category: 'ownership',
    color: '#ec4899',
  },
};

// Helper to get label by ID
export function getTradeLabel(id: TradeLabelId): TradeLabel {
  return tradeLabels[id];
}

// Helper to get labels by category
export function getTradeLabelsByCategory(category: TradeLabelCategory): TradeLabel[] {
  return Object.values(tradeLabels).filter((l) => l.category === category);
}

// Helper to get all labels as array
export function getAllTradeLabels(): TradeLabel[] {
  return Object.values(tradeLabels);
}

// Helper to get category info
export function getTradeLabelCategoryInfo(
  category: TradeLabelCategory
): TradeLabelCategoryInfo | undefined {
  return tradeLabelCategories.find((c) => c.id === category);
}

// Helper to get labels grouped by category
export function getTradeLabelsGroupedByCategory(): Map<TradeLabelCategory, TradeLabel[]> {
  const grouped = new Map<TradeLabelCategory, TradeLabel[]>();
  for (const category of tradeLabelCategories) {
    grouped.set(category.id, getTradeLabelsByCategory(category.id));
  }
  return grouped;
}

// Derive labels from trade data
// Size ranges: $1-1K, 1K-15K, 15K-50K, 50K-100K, 100K-250K, 250K-500K, 500K-1M, 1M+
export function deriveTradeLabels(trade: {
  sizeRange: string;
  filedAfterDays: number;
  owner: string;
}): TradeLabelId[] {
  const labels: TradeLabelId[] = [];

  // Size labels based on sizeRange
  const sizeRange = trade.sizeRange;
  if (sizeRange === '1M+') {
    labels.push('whale-trade');
  } else if (sizeRange === '250K-500K' || sizeRange === '500K-1M') {
    labels.push('large-position');
  } else if (sizeRange === '15K-50K' || sizeRange === '50K-100K' || sizeRange === '100K-250K') {
    labels.push('small-position');
  } else if (sizeRange === '$1-1K' || sizeRange === '1K-15K') {
    labels.push('micro-trade');
  }

  // Disclosure labels based on filedAfterDays
  if (trade.filedAfterDays === 0) {
    labels.push('same-day');
  } else if (trade.filedAfterDays <= 30) {
    labels.push('timely');
  } else if (trade.filedAfterDays <= 45) {
    labels.push('late-disclosure');
  } else {
    labels.push('very-late');
  }

  // Ownership labels
  if (trade.owner === 'Spouse') {
    labels.push('spouse-trade');
  } else if (trade.owner === 'Dependent') {
    labels.push('dependent-trade');
  } else if (trade.owner === 'Joint') {
    labels.push('joint-account');
  }

  return labels;
}
