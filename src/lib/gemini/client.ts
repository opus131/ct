import { GoogleGenAI } from '@google/genai';
import type { Trade } from '../../data/types';
import { buildTradeInsightPrompt, buildMemePrompt, SYSTEM_PROMPT } from './prompts';
import type { GeminiStreamCallback } from './types';

const CACHE_KEY_PREFIX = 'trade-insight-';
const MEME_CACHE_KEY_PREFIX = 'trade-meme-';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

let aiClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY environment variable is not set');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

type CachedInsight = {
  insight: string;
  timestamp: number;
};

function getCacheKey(tradeId: string): string {
  return `${CACHE_KEY_PREFIX}${tradeId}`;
}

function getCachedInsight(tradeId: string): string | null {
  try {
    const cached = localStorage.getItem(getCacheKey(tradeId));
    if (!cached) return null;

    const parsed: CachedInsight = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_DURATION_MS) {
      localStorage.removeItem(getCacheKey(tradeId));
      return null;
    }
    return parsed.insight;
  } catch {
    return null;
  }
}

function setCachedInsight(tradeId: string, insight: string): void {
  try {
    const cacheData: CachedInsight = {
      insight,
      timestamp: Date.now(),
    };
    localStorage.setItem(getCacheKey(tradeId), JSON.stringify(cacheData));
  } catch {
    // localStorage may be full or unavailable
  }
}

export async function generateTradeInsight(
  trade: Trade,
  onChunk?: GeminiStreamCallback
): Promise<string> {
  // Check cache first
  const cached = getCachedInsight(trade.id);
  if (cached) {
    onChunk?.(cached);
    return cached;
  }

  const client = getClient();
  const prompt = buildTradeInsightPrompt(trade);

  try {
    const response = await client.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 256,
        temperature: 0.7,
      },
    });

    let fullText = '';
    for await (const chunk of response) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        onChunk?.(fullText);
      }
    }

    // Cache the result
    setCachedInsight(trade.id, fullText);
    return fullText;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate insight';
    throw new Error(`Gemini API error: ${message}`);
  }
}

export function clearInsightCache(tradeId?: string): void {
  if (tradeId) {
    localStorage.removeItem(getCacheKey(tradeId));
  } else {
    // Clear all cached insights
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  }
}

// Meme generation

type CachedMeme = {
  imageData: string;
  caption: string;
  timestamp: number;
};

function getMemeCacheKey(tradeId: string): string {
  return `${MEME_CACHE_KEY_PREFIX}${tradeId}`;
}

function getCachedMeme(tradeId: string): CachedMeme | null {
  try {
    const cached = localStorage.getItem(getMemeCacheKey(tradeId));
    if (!cached) return null;

    const parsed: CachedMeme = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_DURATION_MS) {
      localStorage.removeItem(getMemeCacheKey(tradeId));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function setCachedMeme(tradeId: string, imageData: string, caption: string): void {
  try {
    const cacheData: CachedMeme = {
      imageData,
      caption,
      timestamp: Date.now(),
    };
    localStorage.setItem(getMemeCacheKey(tradeId), JSON.stringify(cacheData));
  } catch {
    // localStorage may be full or unavailable
  }
}

export type MemeResult = {
  imageData: string;
  caption: string;
};

export async function generateTradeMeme(trade: Trade): Promise<MemeResult> {
  // Check cache first
  const cached = getCachedMeme(trade.id);
  if (cached) {
    return { imageData: cached.imageData, caption: cached.caption };
  }

  const client = getClient();
  const { imagePrompt, caption } = buildMemePrompt(trade);

  try {
    // Use Gemini 3 Pro Image (Nano Banana Pro) for image generation
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: imagePrompt,
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    // Extract image from response
    const candidate = response.candidates?.[0];
    if (!candidate?.content?.parts) {
      throw new Error('No content in response');
    }

    let imageBytes: string | null = null;
    for (const part of candidate.content.parts) {
      if (part.inlineData?.data) {
        imageBytes = part.inlineData.data;
        break;
      }
    }

    if (!imageBytes) {
      throw new Error('No image generated in response');
    }

    // Cache the result
    setCachedMeme(trade.id, imageBytes, caption);

    return { imageData: imageBytes, caption };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate meme';
    throw new Error(`Gemini Image API error: ${message}`);
  }
}

export function clearMemeCache(tradeId?: string): void {
  if (tradeId) {
    localStorage.removeItem(getMemeCacheKey(tradeId));
  } else {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(MEME_CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  }
}
