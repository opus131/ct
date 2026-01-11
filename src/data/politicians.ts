import { getPoliticians, getStats } from './data-service';
export { getPoliticians, getPoliticianById, isLoading, isPoliticiansLoading } from './data-service';

// Re-export as getter for backwards compatibility
export const politicians = {
  get length() {
    return getPoliticians().length;
  },
  slice(start?: number, end?: number) {
    return getPoliticians().slice(start, end);
  },
  filter(predicate: Parameters<typeof Array.prototype.filter>[0]) {
    return getPoliticians().filter(predicate);
  },
  map<T>(mapper: (politician: ReturnType<typeof getPoliticians>[number], index: number) => T): T[] {
    return getPoliticians().map(mapper);
  },
  find(predicate: Parameters<typeof Array.prototype.find>[0]) {
    return getPoliticians().find(predicate);
  },
  [Symbol.iterator]() {
    return getPoliticians()[Symbol.iterator]();
  },
};

// Stats as a reactive getter
export const stats = {
  get trades() {
    return getStats().trades;
  },
  get filings() {
    return getStats().filings;
  },
  get volume() {
    return getStats().volume;
  },
  get politicians() {
    return getStats().politicians;
  },
  get issuers() {
    return getStats().issuers;
  },
};
