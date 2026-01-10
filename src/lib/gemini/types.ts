import type { Trade } from '../../data/types';

export type TradeInsightRequest = {
  trade: Trade;
};

export type TradeInsightResponse = {
  insight: string;
  cached: boolean;
};

export type GeminiStreamCallback = (chunk: string) => void;

export type GenerationState = 'idle' | 'loading' | 'streaming' | 'complete' | 'error';
