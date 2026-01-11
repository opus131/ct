import { getIssuers } from './data-service';
export {
  getIssuers,
  getIssuerById,
  getTradesForIssuer,
  getIssuerPerformance,
  getSP500Performance,
  getAllSectors,
  isIssuersLoading,
  isPerformanceLoading,
} from './data-service';

// Re-export as getter for backwards compatibility
export const issuers = {
  get length() {
    return getIssuers().length;
  },
  slice(start?: number, end?: number) {
    return getIssuers().slice(start, end);
  },
  filter(predicate: Parameters<typeof Array.prototype.filter>[0]) {
    return getIssuers().filter(predicate);
  },
  map<T>(mapper: (issuer: ReturnType<typeof getIssuers>[number], index: number) => T): T[] {
    return getIssuers().map(mapper);
  },
  find(predicate: Parameters<typeof Array.prototype.find>[0]) {
    return getIssuers().find(predicate);
  },
  [Symbol.iterator]() {
    return getIssuers()[Symbol.iterator]();
  },
};
