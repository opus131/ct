#!/usr/bin/env npx tsx
/**
 * Generate committee background image using Gemini
 * Usage: pnpm imagen-committee <committee-id>
 * Example: pnpm imagen-committee ssas
 */

import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';
import sharp from 'sharp';

const COMMITTEES_JSON = './public/data/committee.full.json';
const RAW_OUTPUT_DIR = './public/assets/committees/raw';
const OUTPUT_DIR = './public/assets/committees';

type Committee = {
  _committeeId: string;
  chamber: string;
  committeeName: string;
};

async function main() {
  const committeeId = process.argv[2];

  if (!committeeId) {
    console.error('Usage: pnpm imagen-committee <committee-id>');
    console.error('Example: pnpm imagen-committee ssas');
    process.exit(1);
  }

  // Load committee data
  const committeesRaw = fs.readFileSync(COMMITTEES_JSON, 'utf-8');
  const committees: Committee[] = JSON.parse(committeesRaw);
  const committee = committees.find((c) => c._committeeId === committeeId);

  if (!committee) {
    console.error(`Committee not found: ${committeeId}`);
    console.error('Available IDs:', committees.map((c) => c._committeeId).join(', '));
    process.exit(1);
  }

  console.log(`Generating background for: ${committee.committeeName}`);
  console.log(`Chamber: ${committee.chamber}`);

  // Initialize Gemini client
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: Gemini API key not found.');
    console.error('Set VITE_GEMINI_API_KEY or GEMINI_API_KEY environment variable.');
    console.error('Example: GEMINI_API_KEY=your-key pnpm imagen-committee ssas');
    process.exit(1);
  }

  const client = new GoogleGenAI({ apiKey });

  // Build prompt
  const prompt = `Create a dark, atmospheric background image for the "${committee.committeeName}" congressional committee.
Style: Modern, abstract, dark theme with subtle gradients.
Colors: Deep blues, purples, and dark grays with subtle accent glows.
Include subtle symbolic elements related to the committee's focus area.
The image should be suitable as a website header background - wide aspect ratio (16:9), not too busy, with darker areas for text overlay.
No text, no people, no faces. Abstract and professional.`;

  console.log('\nGenerating image with Gemini...');

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: prompt,
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

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

    // Ensure directories exist
    fs.mkdirSync(RAW_OUTPUT_DIR, { recursive: true });
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // Save raw image
    const rawBuffer = Buffer.from(imageBytes, 'base64');
    const rawPath = path.join(RAW_OUTPUT_DIR, `${committeeId}_background_raw.png`);
    fs.writeFileSync(rawPath, rawBuffer);
    console.log(`\nRaw image saved: ${rawPath}`);

    // Resize and convert to webp
    const outputPath = path.join(OUTPUT_DIR, `bg-${committeeId}.webp`);
    await sharp(rawBuffer)
      .resize(1400, 400, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toFile(outputPath);

    console.log(`Final image saved: ${outputPath}`);
    console.log('\nDone!');
  } catch (error) {
    console.error('Failed to generate image:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
