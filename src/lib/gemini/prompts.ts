import type { Trade } from '../../data/types';

export function buildTradeInsightPrompt(trade: Trade): string {
  const partyAbbrev = trade.politician.party === 'Democrat' ? 'D' : trade.politician.party === 'Republican' ? 'R' : 'I';

  return `You are an analyst providing brief, speculative insights about congressional stock trades.

Given this congressional stock trade:
- Politician: ${trade.politician.name} (${partyAbbrev}-${trade.politician.state}), ${trade.politician.chamber}
- Action: ${trade.type.toUpperCase()} ${trade.issuer.name} (${trade.issuer.ticker})
- Trade Date: ${trade.tradedAt}
- Size: ${trade.sizeRange}
- Filed ${trade.filedAfterDays} days after trade
- Owner: ${trade.owner}

Generate a brief (2-3 sentences) speculative analysis of possible motivations or context for this trade. Consider factors like:
- Market conditions and sector trends at the time
- The politician's committee assignments (if commonly known)
- General timing patterns
- The size and filing delay

Be balanced and objective. Avoid partisan framing.

End with: "[AI speculation based on public data]"`;
}

export const SYSTEM_PROMPT = `You are a concise financial analyst assistant. Provide brief, factual speculation about congressional stock trades. Always maintain objectivity and note that your analysis is speculative.`;

type MemePromptResult = {
  imagePrompt: string;
  caption: string;
};

// Style prefix for all meme images
const STYLE = 'hyper-realistic, cinematic lighting, ray-traced, 8K render, dramatic atmosphere, photorealistic';

// Known politician appearances for better likeness
const POLITICIAN_APPEARANCES: Record<string, string> = {
  'Nancy Pelosi': 'elderly woman with short brown hair, pearl necklace, elegant pantsuit',
  'Tommy Tuberville': 'tall older man with white hair, former football coach build, square jaw',
  'Josh Gottheimer': 'middle-aged man with dark hair, glasses, clean-shaven',
  'David Rouzer': 'middle-aged man with receding hairline, glasses',
  'Mike Kelly': 'older man with white hair, round face',
  'Bernie Moreno': 'middle-aged Hispanic man with dark hair, businessman appearance',
  'Jonathan Jackson': 'African American man, younger congressman',
};

// Get detailed politician description
function getPoliticianDescription(trade: Trade): string {
  const name = trade.politician.name;
  const party = trade.politician.party;
  const partyColor = party === 'Democrat' ? 'blue' : party === 'Republican' ? 'red' : 'purple';
  const partyStyle = party === 'Democrat' ? 'blue tie, Democratic pin' : party === 'Republican' ? 'red tie, American flag pin' : 'purple tie';

  // Check for known politician
  const knownAppearance = POLITICIAN_APPEARANCES[name];
  if (knownAppearance) {
    return `${knownAppearance}, wearing ${partyStyle}, ${party} politician`;
  }

  // Infer gender from common name patterns
  const femaleNames = ['Nancy', 'Elizabeth', 'Debbie', 'Diane', 'Barbara', 'Maria', 'Susan', 'Karen', 'Lisa', 'Michelle', 'Jennifer', 'Amy', 'Kirsten', 'Tammy', 'Catherine', 'Maxine'];
  const firstName = name.split(' ')[0];
  const isFemale = femaleNames.some(n => firstName.startsWith(n));

  if (isFemale) {
    return `professional woman politician, ${partyStyle}, confident posture, ${party} ${trade.politician.chamber} member`;
  }
  return `professional man politician, ${partyStyle}, authoritative presence, ${party} ${trade.politician.chamber} member`;
}

// Helper to get issuer context for prompts
function getIssuerContext(trade: Trade): string {
  const ticker = trade.issuer.ticker || trade.issuer.name;
  const name = trade.issuer.name;

  if (ticker === 'NVDA' || name.includes('NVIDIA')) return 'glowing green GPU graphics cards, NVIDIA data center, green ambient lighting';
  if (ticker === 'AAPL' || name.includes('Apple')) return 'sleek Apple Store interior, iPhones, MacBooks, minimalist white design';
  if (ticker === 'MSFT' || name.includes('Microsoft')) return 'Microsoft campus, Azure cloud visualizations, blue corporate aesthetic';
  if (ticker === 'TSLA' || name.includes('Tesla')) return 'Tesla factory floor, Cybertruck, electric vehicles, futuristic design';
  if (ticker === 'GOOGL' || ticker === 'GOOG' || name.includes('Google')) return 'Google campus, colorful office, search interface screens';
  if (ticker === 'AMZN' || name.includes('Amazon')) return 'Amazon fulfillment center, delivery drones, Prime branding';
  if (ticker === 'META' || name.includes('Meta') || name.includes('Facebook')) return 'Meta headquarters, VR headsets, metaverse portal';
  if (ticker === 'BA' || name.includes('Boeing')) return 'Boeing aircraft hangar, 737 MAX, aerospace facility';
  if (ticker === 'JPM' || name.includes('JPMorgan')) return 'Wall Street trading floor, gold vault, marble banking hall';
  if (ticker === 'NFLX' || name.includes('Netflix')) return 'Netflix studio lot, streaming screens, red carpet premiere';
  if (ticker === 'PLTR' || name.includes('Palantir')) return 'Palantir war room, data visualization screens, government contractor aesthetic';
  if (ticker === 'HOOD' || name.includes('Robinhood')) return 'Robinhood app interface giant screen, confetti, gamified trading';
  if (name.includes('Bank') || name.includes('Finance')) return 'bank vault interior, stacks of money, marble columns';
  return `${name} corporate lobby, stock ticker displays showing ${ticker}`;
}

const MEME_SCENARIOS = [
  {
    // NVIDIA specific - reverent tech worship
    condition: (trade: Trade) => trade.issuer.ticker === 'NVDA' || trade.issuer.name.includes('NVIDIA'),
    template: (trade: Trade) => ({
      imagePrompt: `${STYLE}. Portrait of ${getPoliticianDescription(trade)} in a dark server room, face illuminated by green light from a massive NVIDIA H100 GPU held reverently in their hands, expression of awe, data center racks in background, Jensen Huang poster on wall, cinematic green lighting`,
      caption: `${trade.politician.name} (${trade.politician.party === 'Democrat' ? 'D' : 'R'}) receives the blessing of Jensen`,
    }),
  },
  {
    // Large buy - victory press conference
    condition: (trade: Trade) => trade.type === 'buy' && (trade.sizeRange.includes('250K') || trade.sizeRange.includes('500K') || trade.sizeRange.includes('1M')),
    template: (trade: Trade) => ({
      imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} at a press conference podium, triumphant expression, confetti falling, ${getIssuerContext(trade)} logos on backdrop, reporters with cameras in foreground, "BREAKING NEWS: ${trade.issuer.ticker} PURCHASE" chyron visible, dramatic spotlights`,
      caption: `${trade.politician.name} announces "strategic investment" in ${trade.issuer.ticker || trade.issuer.name}`,
    }),
  },
  {
    // Late filing - noir detective scene
    condition: (trade: Trade) => trade.filedAfterDays > 30,
    template: (trade: Trade) => ({
      imagePrompt: `${STYLE}. Film noir style, ${getPoliticianDescription(trade)} sitting alone in a dark office at night, desk lamp casting dramatic shadows, calendar showing ${trade.filedAfterDays} days circled in red, SEC filing papers scattered on desk, ${trade.issuer.ticker} stock chart on old monitor, venetian blind shadows, cigarette smoke optional`,
      caption: `${trade.politician.name}: ${trade.filedAfterDays} days late. "The dog ate my disclosure."`,
    }),
  },
  {
    // Spouse trade - pillow talk scene
    condition: (trade: Trade) => trade.owner === 'Spouse',
    template: (trade: Trade) => ({
      imagePrompt: `${STYLE}. Elegant bedroom scene, ${getPoliticianDescription(trade)} whispering to spouse in silk pajamas, ${trade.issuer.ticker} stock app glowing on smartphone between them, financial documents peeking from under pillow, moonlight through window, intimate conspiratorial mood, ${trade.issuer.name} annual report on nightstand`,
      caption: `${trade.politician.name}'s spouse had a "hunch" about ${trade.issuer.ticker || trade.issuer.name}`,
    }),
  },
  {
    // Boeing/Defense - patriotic military industrial
    condition: (trade: Trade) => trade.issuer.ticker === 'BA' || trade.issuer.ticker === 'LMT' || trade.issuer.ticker === 'RTX' || trade.issuer.name.includes('Boeing') || trade.issuer.name.includes('Lockheed'),
    template: (trade: Trade) => ({
      imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} standing on aircraft carrier deck, fighter jets in background, American flag waving dramatically, ${trade.issuer.name} logo on aircraft, sunset patriotic lighting, expression of solemn duty, military officers saluting`,
      caption: `${trade.politician.name} ${trade.type === 'buy' ? 'invests in' : 'divests from'} national security`,
    }),
  },
  {
    // Tech buy - Matrix-style hacker scene
    condition: (trade: Trade) => trade.type === 'buy' && (trade.issuer.ticker === 'AAPL' || trade.issuer.ticker === 'MSFT' || trade.issuer.ticker === 'GOOGL' || trade.issuer.ticker === 'META' || trade.issuer.ticker === 'AMZN'),
    template: (trade: Trade) => ({
      imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} seated in futuristic command chair, surrounded by holographic ${trade.issuer.name} data streams, green matrix-style code reflections on face, multiple floating screens showing stock charts, cyberpunk corporate aesthetic, blue and purple neon lighting`,
      caption: `${trade.politician.name} plugs into the ${trade.issuer.ticker} matrix`,
    }),
  },
  {
    // Sell before drop - escape room thriller
    condition: (trade: Trade) => trade.type === 'sell' && trade.filedAfterDays > 20,
    template: (trade: Trade) => ({
      imagePrompt: `${STYLE}. Thriller movie poster style, ${getPoliticianDescription(trade)} bursting through exit door into daylight, ${trade.issuer.name} building exploding dramatically behind them, briefcase in hand, papers flying everywhere, slow-motion debris, looking back with knowing expression`,
      caption: `${trade.politician.name} exits ${trade.issuer.ticker || trade.issuer.name} just in time`,
    }),
  },
  {
    // Generic buy - chess grandmaster
    condition: (trade: Trade) => trade.type === 'buy',
    template: (trade: Trade) => ({
      imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} playing chess in ornate library, chess pieces replaced with miniature ${getIssuerContext(trade)}, thoughtful expression, hand hovering over piece, opponent's king about to fall, warm fireplace lighting, Capitol building model visible on shelf`,
      caption: `${trade.politician.name} makes their move on ${trade.issuer.ticker || trade.issuer.name}`,
    }),
  },
  {
    // Generic sell - casino cashout
    condition: (trade: Trade) => trade.type === 'sell',
    template: (trade: Trade) => ({
      imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} at luxury casino cashier window, sliding ${trade.issuer.ticker} stock certificates across counter, receiving stacks of cash, satisfied smirk, "WINNER" neon signs, slot machines showing ${trade.issuer.name} logos in background, Vegas glamour aesthetic`,
      caption: `${trade.politician.name} cashes out of ${trade.issuer.ticker || trade.issuer.name}. House always wins.`,
    }),
  },
];

const DEFAULT_MEME = (trade: Trade): MemePromptResult => ({
  imagePrompt: `${STYLE}. Close-up portrait of ${getPoliticianDescription(trade)} in congressional office, American flag behind, holding phone showing ${trade.issuer.ticker || trade.issuer.name} stock chart with ${trade.type === 'buy' ? 'green upward' : 'red downward'} arrow, subtle knowing smile, dramatic Rembrandt lighting, ${trade.issuer.name} document visible on desk`,
  caption: `${trade.politician.name} (${trade.politician.party === 'Democrat' ? 'D' : 'R'}-${trade.politician.state}): "${trade.type === 'buy' ? 'Buying' : 'Selling'} ${trade.issuer.ticker || trade.issuer.name}? Just a hunch."`,
});

export function buildMemePrompt(trade: Trade): MemePromptResult {
  // Find matching scenario or use default
  for (const scenario of MEME_SCENARIOS) {
    if (scenario.condition(trade)) {
      return scenario.template(trade);
    }
  }
  return DEFAULT_MEME(trade);
}
