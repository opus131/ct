import { getTrades, getTradesForPolitician } from './data-service';
import type { Trade } from './types';

// Re-export actual trades as mock trades for backwards compatibility
export const mockTrades = {
  get length() {
    return getTrades().length;
  },
  slice(start?: number, end?: number) {
    return getTrades().slice(start, end);
  },
  filter(predicate: Parameters<typeof Array.prototype.filter>[0]) {
    return getTrades().filter(predicate);
  },
  flatMap<T>(mapper: (trade: Trade, index: number) => T[]): T[] {
    return getTrades().flatMap(mapper);
  },
  [Symbol.iterator]() {
    return getTrades()[Symbol.iterator]();
  },
};

// Export function to get trades for a specific politician
export function getMockTradesForPolitician(politicianId: string): Trade[] {
  return getTradesForPolitician(politicianId);
}
