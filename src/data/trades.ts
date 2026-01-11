import { getTrades } from './data-service';
export { getTrades, getTradesForPolitician } from './data-service';

// Re-export as getter for backwards compatibility
// Components should migrate to using getTrades() directly
export const trades = {
  get length() {
    return getTrades().length;
  },
  slice(start?: number, end?: number) {
    return getTrades().slice(start, end);
  },
  filter(predicate: Parameters<typeof Array.prototype.filter>[0]) {
    return getTrades().filter(predicate);
  },
  map<T>(mapper: (trade: ReturnType<typeof getTrades>[number], index: number) => T): T[] {
    return getTrades().map(mapper);
  },
  find(predicate: Parameters<typeof Array.prototype.find>[0]) {
    return getTrades().find(predicate);
  },
  [Symbol.iterator]() {
    return getTrades()[Symbol.iterator]();
  },
};
