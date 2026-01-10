import type { Trade, TradeType, OwnerType } from './types';
import { politicians } from './politicians';

const ISSUERS = [
  { id: 'AAPL', name: 'Apple Inc', ticker: 'AAPL:US' },
  { id: 'MSFT', name: 'Microsoft Corp', ticker: 'MSFT:US' },
  { id: 'GOOGL', name: 'Alphabet Inc', ticker: 'GOOGL:US' },
  { id: 'AMZN', name: 'Amazon.com Inc', ticker: 'AMZN:US' },
  { id: 'NVDA', name: 'NVIDIA Corporation', ticker: 'NVDA:US' },
  { id: 'META', name: 'Meta Platforms Inc', ticker: 'META:US' },
  { id: 'TSLA', name: 'Tesla Inc', ticker: 'TSLA:US' },
  { id: 'JPM', name: 'JPMorgan Chase & Co', ticker: 'JPM:US' },
  { id: 'V', name: 'Visa Inc', ticker: 'V:US' },
  { id: 'JNJ', name: 'Johnson & Johnson', ticker: 'JNJ:US' },
  { id: 'WMT', name: 'Walmart Inc', ticker: 'WMT:US' },
  { id: 'PG', name: 'Procter & Gamble Co', ticker: 'PG:US' },
  { id: 'MA', name: 'Mastercard Inc', ticker: 'MA:US' },
  { id: 'UNH', name: 'UnitedHealth Group', ticker: 'UNH:US' },
  { id: 'HD', name: 'Home Depot Inc', ticker: 'HD:US' },
  { id: 'DIS', name: 'Walt Disney Co', ticker: 'DIS:US' },
  { id: 'BAC', name: 'Bank of America Corp', ticker: 'BAC:US' },
  { id: 'XOM', name: 'Exxon Mobil Corp', ticker: 'XOM:US' },
  { id: 'PFE', name: 'Pfizer Inc', ticker: 'PFE:US' },
  { id: 'COST', name: 'Costco Wholesale', ticker: 'COST:US' },
  { id: 'AMD', name: 'Advanced Micro Devices', ticker: 'AMD:US' },
  { id: 'NFLX', name: 'Netflix Inc', ticker: 'NFLX:US' },
  { id: 'CRM', name: 'Salesforce Inc', ticker: 'CRM:US' },
  { id: 'INTC', name: 'Intel Corporation', ticker: 'INTC:US' },
  { id: 'CSCO', name: 'Cisco Systems Inc', ticker: 'CSCO:US' },
  { id: 'ORCL', name: 'Oracle Corporation', ticker: 'ORCL:US' },
  { id: 'ADBE', name: 'Adobe Inc', ticker: 'ADBE:US' },
  { id: 'BA', name: 'Boeing Co', ticker: 'BA:US' },
  { id: 'LMT', name: 'Lockheed Martin Corp', ticker: 'LMT:US' },
  { id: 'RTX', name: 'RTX Corporation', ticker: 'RTX:US' },
];

const SIZE_RANGES = ['1K-15K', '15K-50K', '50K-100K', '100K-250K', '250K-500K', '500K-1M', '1M-5M'];
const SIZE_WEIGHTS = [35, 25, 18, 12, 6, 3, 1]; // More small trades

const OWNER_TYPES: OwnerType[] = ['Self', 'Joint', 'Spouse', 'Dependent', 'Undisclosed'];
const OWNER_WEIGHTS = [40, 25, 20, 10, 5];

function weightedRandom<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function generateTradesForPolitician(politicianId: string, count: number): Trade[] {
  const politician = politicians.find((p) => p.id === politicianId);
  if (!politician) return [];

  const trades: Trade[] = [];
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2025-12-31');

  // Create trading "bursts" - politicians often trade in clusters
  const burstCount = Math.floor(count / 8);
  const burstDates: Date[] = [];
  for (let i = 0; i < burstCount; i++) {
    burstDates.push(randomDate(startDate, endDate));
  }

  for (let i = 0; i < count; i++) {
    // 60% chance of being near a burst date
    let tradeDate: Date;
    if (Math.random() < 0.6 && burstDates.length > 0) {
      const burstDate = burstDates[Math.floor(Math.random() * burstDates.length)];
      const offset = (Math.random() - 0.5) * 14 * 24 * 60 * 60 * 1000; // +/- 7 days
      tradeDate = new Date(burstDate.getTime() + offset);
    } else {
      tradeDate = randomDate(startDate, endDate);
    }

    // Clamp to valid range
    if (tradeDate < startDate) tradeDate = startDate;
    if (tradeDate > endDate) tradeDate = endDate;

    const issuer = ISSUERS[Math.floor(Math.random() * ISSUERS.length)];
    const tradeType: TradeType = Math.random() < 0.55 ? 'buy' : 'sell';
    const filedAfterDays = Math.floor(Math.random() * 40) + 5;

    const publishDate = new Date(tradeDate);
    publishDate.setDate(publishDate.getDate() + filedAfterDays);

    trades.push({
      id: `mock-${politicianId}-${i}`,
      politician: {
        id: politician.id,
        name: politician.name,
        party: politician.party,
        chamber: politician.chamber,
        state: politician.state,
        photoUrl: politician.photoUrl,
      },
      issuer: {
        id: issuer.id,
        name: issuer.name,
        ticker: issuer.ticker,
      },
      publishedAt: formatDate(publishDate),
      tradedAt: formatDate(tradeDate),
      filedAfterDays,
      owner: weightedRandom(OWNER_TYPES, OWNER_WEIGHTS),
      type: tradeType,
      sizeRange: weightedRandom(SIZE_RANGES, SIZE_WEIGHTS),
      price: Math.round(Math.random() * 500 * 100) / 100 + 20,
    });
  }

  return trades.sort((a, b) => new Date(b.tradedAt).getTime() - new Date(a.tradedAt).getTime());
}

// Generate mock trades for each politician
export const mockTrades: Trade[] = politicians.flatMap((p) => {
  // Generate roughly the number of trades listed for each politician
  const tradeCount = Math.min(p.trades, 150); // Cap at 150 per politician
  return generateTradesForPolitician(p.id, tradeCount);
});

// Export function to get trades for a specific politician
export function getMockTradesForPolitician(politicianId: string): Trade[] {
  return mockTrades.filter((t) => t.politician.id === politicianId);
}
