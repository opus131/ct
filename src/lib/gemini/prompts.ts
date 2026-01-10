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
  // Democrats - Senate
  'Nancy Pelosi': 'elderly woman, 84 years old, short styled brown hair, pearl necklace, elegant designer pantsuit, sharp features, thin build',
  'Chuck Schumer': 'older man, 74 years old, glasses perched low on nose, gray hair, stocky build, New York accent demeanor',
  'Elizabeth Warren': 'older woman, 75 years old, blonde hair, glasses, professorial appearance, energetic demeanor',
  'Bernie Sanders': 'elderly man, 83 years old, wild white hair, glasses, slouched posture, Brooklyn accent demeanor',
  'Dianne Feinstein': 'elderly woman, 90 years old, short white hair, dignified appearance, frail but determined',
  'Mark Kelly': 'middle-aged man, 60 years old, bald, fit astronaut build, military bearing, clean-shaven',
  'Kyrsten Sinema': 'middle-aged woman, 48 years old, colorful fashion, distinctive style, blonde hair with highlights',

  // Democrats - House
  'Alexandria Ocasio-Cortez': 'young woman, 35 years old, long dark hair, red lipstick, energetic expression, Latina',
  'Adam Schiff': 'middle-aged man, 64 years old, thin build, large eyes, serious expression, dark hair graying',
  'Maxine Waters': 'elderly African American woman, 86 years old, signature wig, bold fashion, commanding presence',
  'Hakeem Jeffries': 'middle-aged African American man, 54 years old, bald, glasses, sharp suits, Brooklyn style',
  'Josh Gottheimer': 'middle-aged man, 49 years old, dark hair, glasses, clean-shaven, moderate demeanor',
  'Ro Khanna': 'middle-aged Indian American man, 48 years old, dark hair, tech-savvy appearance',
  'Katie Porter': 'middle-aged woman, 50 years old, red hair, glasses, whiteboard-ready demeanor',
  'Jonathan Jackson': 'African American man, 58 years old, son of Jesse Jackson, dignified bearing',

  // Republicans - Senate
  'Mitch McConnell': 'elderly man, 82 years old, jowly face, thin lips, hunched posture, calculating expression',
  'Ted Cruz': 'middle-aged man, 54 years old, beard, dark hair, heavyset, Texas swagger',
  'Rand Paul': 'middle-aged man, 61 years old, curly gray hair, libertarian intellectual look',
  'Marco Rubio': 'middle-aged Latino man, 53 years old, dark hair, youthful appearance, Cuban heritage',
  'Tommy Tuberville': 'tall older man, 70 years old, white hair, former football coach build, square jaw, athletic',
  'Rick Scott': 'older man, 71 years old, bald, tall, thin, intense gaze, Florida tan',
  'John Kennedy': 'older man, 72 years old, silver hair, folksy Louisiana appearance, theatrical expressions',
  'Bernie Moreno': 'middle-aged Hispanic man, 57 years old, dark hair, businessman appearance, Ohio dealership owner look',

  // Republicans - House
  'Marjorie Taylor Greene': 'middle-aged woman, 50 years old, blonde hair, athletic CrossFit build, intense expression',
  'Kevin McCarthy': 'middle-aged man, 59 years old, dark hair graying, tall, California polished look',
  'Jim Jordan': 'middle-aged man, 60 years old, no jacket wrestler look, receding hairline, intense demeanor',
  'Matt Gaetz': 'younger man, 42 years old, dark hair, square jaw, Florida fratboy appearance',
  'Lauren Boebert': 'younger woman, 37 years old, dark hair, glasses, Western Colorado style',
  'Dan Crenshaw': 'younger man, 40 years old, eyepatch, military bearing, fit, former Navy SEAL',
  'Mike Kelly': 'older man, 76 years old, white hair, round face, car dealer background',
  'David Rouzer': 'middle-aged man, 52 years old, receding hairline, glasses, North Carolina farmer look',
  'Michael McCaul': 'older man, 62 years old, gray hair, distinguished Texas businessman appearance',
  'French Hill': 'older man, 68 years old, glasses, banker appearance, Arkansas gentleman',

  // Independents
  'Angus King': 'older man, 80 years old, white mustache, Maine outdoorsman look, independent spirit',
};

// Female first names for gender detection
const FEMALE_NAMES = [
  'Nancy', 'Elizabeth', 'Debbie', 'Diane', 'Barbara', 'Maria', 'Susan', 'Karen',
  'Lisa', 'Michelle', 'Jennifer', 'Amy', 'Kirsten', 'Tammy', 'Catherine', 'Maxine',
  'Alexandria', 'Katie', 'Lauren', 'Marjorie', 'Elise', 'Cathy', 'Virginia', 'Ann',
  'Anna', 'Mary', 'Patricia', 'Linda', 'Sarah', 'Betty', 'Dorothy', 'Sandra',
  'Ashley', 'Kimberly', 'Emily', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Laura',
  'Cynthia', 'Kathleen', 'Teresa', 'Janet', 'Frances', 'Gloria', 'Janice', 'Jean',
  'Judy', 'Julia', 'Grace', 'Victoria', 'Cheryl', 'Megan', 'Andrea', 'Hannah',
  'Jacqueline', 'Martha', 'Christine', 'Marie', 'Janet', 'Deborah', 'Stephanie',
  'Rebecca', 'Carolyn', 'Joyce', 'Brenda', 'Pamela', 'Nicole', 'Samantha', 'Katherine',
  'Emma', 'Abigail', 'Olivia', 'Sophia', 'Isabella', 'Ava', 'Mia', 'Charlotte',
  'Heather', 'Teresa', 'Doris', 'Evelyn', 'Jean', 'Cheryl', 'Mildred', 'Joan',
  'Brittany', 'Annie', 'Diana', 'Natalie', 'Judy', 'Theresa', 'Christina', 'Rachel',
  'Bonnie', 'Yvonne', 'Sheila', 'Rosa', 'Darlene', 'Elaine', 'Norma', 'Tiffany',
  'Pramila', 'Ilhan', 'Rashida', 'Ayanna', 'Cori', 'Veronica', 'Kat', 'Val', 'Suzan',
  'Mikie', 'Angie', 'Nanette', 'Lucille', 'Sylvia', 'Alma', 'Frederica', 'Terri',
];

// Get party-specific styling based on gender
function getPartyStyle(party: string, isFemale: boolean): string {
  if (party === 'Democrat') {
    return isFemale
      ? 'elegant blue dress or pantsuit, Democratic donkey pin, pearl earrings'
      : 'navy blue suit, blue tie, Democratic donkey pin, American flag lapel';
  }
  if (party === 'Republican') {
    return isFemale
      ? 'red power dress or blazer, elephant pin, patriotic accessories'
      : 'charcoal suit, red power tie, elephant pin, American flag lapel';
  }
  // Independent
  return isFemale
    ? 'professional purple or teal outfit, independent bearing'
    : 'gray suit, purple tie, centrist demeanor';
}

// Get detailed politician description
function getPoliticianDescription(trade: Trade): string {
  const name = trade.politician.name;
  const party = trade.politician.party;
  const chamber = trade.politician.chamber;
  const state = trade.politician.state;

  // Check for known politician
  const knownAppearance = POLITICIAN_APPEARANCES[name];

  // Determine gender
  const firstName = name.split(' ')[0];
  const isFemale = FEMALE_NAMES.some(n => firstName.toLowerCase().startsWith(n.toLowerCase()));
  const partyStyle = getPartyStyle(party, isFemale);

  if (knownAppearance) {
    return `${knownAppearance}, wearing ${partyStyle}, ${party} ${chamber} member from ${state}`;
  }

  // Generate description for unknown politicians
  const genderDesc = isFemale ? 'woman' : 'man';
  const chamberTitle = chamber === 'Senate' ? 'Senator' : 'Representative';

  if (isFemale) {
    return `professional ${genderDesc} politician, ${chamberTitle}, ${partyStyle}, confident commanding presence, ${party} ${chamber} member from ${state}`;
  }
  return `professional ${genderDesc} politician, ${chamberTitle}, ${partyStyle}, authoritative bearing, ${party} ${chamber} member from ${state}`;
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

// Randomize among multiple templates for same condition
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const MEME_SCENARIOS = [
  // ===== SPECIFIC STOCK SCENARIOS =====
  {
    // NVIDIA specific - reverent tech worship
    condition: (trade: Trade) => trade.issuer.ticker === 'NVDA' || trade.issuer.name.includes('NVIDIA'),
    template: (trade: Trade) => pickRandom([
      {
        imagePrompt: `${STYLE}. Portrait of ${getPoliticianDescription(trade)} in a dark server room, face illuminated by green light from a massive NVIDIA H100 GPU held reverently in their hands, expression of awe, data center racks in background, Jensen Huang poster on wall, cinematic green lighting`,
        caption: `${trade.politician.name} (${trade.politician.party === 'Democrat' ? 'D' : 'R'}-${trade.politician.state}) receives the blessing of Jensen`,
      },
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} kneeling before altar made of stacked GPUs, NVIDIA cathedral of technology, green divine light streaming down, worshipful expression, tech pilgrimage aesthetic`,
        caption: `${trade.politician.name} makes pilgrimage to the Church of NVIDIA`,
      },
    ]),
  },
  {
    // Tesla - Elon fanboy/fangirl
    condition: (trade: Trade) => trade.issuer.ticker === 'TSLA' || trade.issuer.name.includes('Tesla'),
    template: (trade: Trade) => pickRandom([
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} standing next to Cybertruck in Tesla showroom, arms crossed confidently, electric blue lighting, futuristic aesthetic, Mars poster in background`,
        caption: `${trade.politician.name} ${trade.type === 'buy' ? 'bets on' : 'exits'} the Musk-verse`,
      },
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} charging station scene, plugging in electric vehicle, smug expression, green energy aesthetic, solar panels visible`,
        caption: `${trade.politician.name} ${trade.type === 'buy' ? 'charges up' : 'unplugs from'} TSLA`,
      },
    ]),
  },
  {
    // Pharma/Healthcare
    condition: (trade: Trade) => trade.issuer.ticker === 'PFE' || trade.issuer.ticker === 'JNJ' || trade.issuer.ticker === 'MRNA' || trade.issuer.ticker === 'UNH' || trade.issuer.name.includes('Pharma') || trade.issuer.name.includes('Health'),
    template: (trade: Trade) => ({
      imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} in white lab coat, standing in pharmaceutical laboratory, holding giant pill bottle labeled "${trade.issuer.ticker}", test tubes and molecules floating around, clinical blue-white lighting, healthcare aesthetic`,
      caption: `${trade.politician.name} prescribes ${trade.type === 'buy' ? 'a dose of' : 'selling'} ${trade.issuer.ticker || trade.issuer.name}`,
    }),
  },
  {
    // Oil/Energy
    condition: (trade: Trade) => trade.issuer.ticker === 'XOM' || trade.issuer.ticker === 'CVX' || trade.issuer.ticker === 'OXY' || trade.issuer.name.includes('Oil') || trade.issuer.name.includes('Energy') || trade.issuer.name.includes('Petroleum'),
    template: (trade: Trade) => ({
      imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} standing before oil derricks at sunset, hard hat on head, black gold gushing in background, Texas oilfield aesthetic, golden hour lighting, crude oil barrels stacked nearby`,
      caption: `${trade.politician.name} strikes ${trade.type === 'buy' ? 'black gold' : 'out'} with ${trade.issuer.ticker || trade.issuer.name}`,
    }),
  },
  {
    // Banks/Finance
    condition: (trade: Trade) => trade.issuer.ticker === 'JPM' || trade.issuer.ticker === 'GS' || trade.issuer.ticker === 'BAC' || trade.issuer.ticker === 'C' || trade.issuer.ticker === 'WFC' || trade.issuer.name.includes('Bank'),
    template: (trade: Trade) => pickRandom([
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} in marble bank vault, surrounded by gold bars, ${trade.issuer.name} logo on vault door, monocle and top hat, Gilded Age aesthetic, warm golden lighting`,
        caption: `${trade.politician.name} visits the ${trade.issuer.ticker} vault`,
      },
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} on Wall Street trading floor, screens flashing green, traders in background, power stance, money raining from ceiling, ${trade.issuer.name} banner visible`,
        caption: `${trade.politician.name} ${trade.type === 'buy' ? 'goes long' : 'closes position'} on ${trade.issuer.ticker}`,
      },
    ]),
  },

  // ===== TRADE SIZE SCENARIOS =====
  {
    // Large buy - victory press conference
    condition: (trade: Trade) => trade.type === 'buy' && (trade.sizeRange.includes('500K') || trade.sizeRange.includes('1M') || trade.sizeRange.includes('5M')),
    template: (trade: Trade) => pickRandom([
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} at a press conference podium, triumphant expression, confetti falling, ${getIssuerContext(trade)} logos on backdrop, reporters with cameras in foreground, "BREAKING NEWS" chyron visible, dramatic spotlights`,
        caption: `${trade.politician.name} announces "strategic investment" in ${trade.issuer.ticker || trade.issuer.name}`,
      },
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} doing victory lap in convertible through Wall Street, ticker tape parade, crowds cheering, ${trade.issuer.ticker} banner on car, celebration atmosphere`,
        caption: `${trade.politician.name} celebrates ${trade.sizeRange} ${trade.issuer.ticker} purchase`,
      },
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} at yacht club, champagne toast, luxury yacht in background named "S.S. ${trade.issuer.ticker}", wealthy lifestyle aesthetic, sunset over marina`,
        caption: `${trade.politician.name}: "${trade.sizeRange} in ${trade.issuer.ticker}? Just a small position."`,
      },
    ]),
  },
  {
    // Small trade - sneaky vibes
    condition: (trade: Trade) => trade.sizeRange.includes('1K') || trade.sizeRange.includes('15K'),
    template: (trade: Trade) => ({
      imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} peeking through venetian blinds nervously, phone in hand showing ${trade.issuer.ticker} app, dim office lighting, paranoid expression, shadows across face`,
      caption: `${trade.politician.name} quietly ${trade.type === 'buy' ? 'picks up' : 'offloads'} some ${trade.issuer.ticker}`,
    }),
  },

  // ===== TIMING SCENARIOS =====
  {
    // Late filing - noir detective scene
    condition: (trade: Trade) => trade.filedAfterDays > 30,
    template: (trade: Trade) => pickRandom([
      {
        imagePrompt: `${STYLE}. Film noir style, ${getPoliticianDescription(trade)} sitting alone in a dark office at night, desk lamp casting dramatic shadows, calendar showing ${trade.filedAfterDays} days circled in red, SEC filing papers scattered on desk, venetian blind shadows`,
        caption: `${trade.politician.name}: ${trade.filedAfterDays} days late. "The dog ate my disclosure."`,
      },
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} tiptoeing past SEC building at midnight, carrying folder marked "${trade.issuer.ticker} TRADE", exaggerated sneaky pose, moonlight scene, cartoon burglar aesthetic but photorealistic`,
        caption: `${trade.politician.name} finally files... ${trade.filedAfterDays} days later`,
      },
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} in courtroom witness stand, sweating, spotlight on face, judge's gavel raised, ${trade.filedAfterDays} days written on evidence board, legal drama aesthetic`,
        caption: `"${trade.filedAfterDays} days? I was... busy." - ${trade.politician.name}`,
      },
    ]),
  },
  {
    // Same-day filing - too clean
    condition: (trade: Trade) => trade.filedAfterDays <= 1,
    template: (trade: Trade) => ({
      imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} polishing a halo above their head, angelic lighting, pristine white office, compliance certificates framed on wall, suspiciously perfect aesthetic`,
      caption: `${trade.politician.name} filed within ${trade.filedAfterDays} day(s). Nothing suspicious here.`,
    }),
  },

  // ===== OWNER TYPE SCENARIOS =====
  {
    // Spouse trade - pillow talk scene
    condition: (trade: Trade) => trade.owner === 'Spouse',
    template: (trade: Trade) => pickRandom([
      {
        imagePrompt: `${STYLE}. Elegant bedroom scene, ${getPoliticianDescription(trade)} whispering to spouse in silk pajamas, ${trade.issuer.ticker} stock app glowing on smartphone between them, moonlight through window, intimate conspiratorial mood`,
        caption: `${trade.politician.name}'s spouse had a "hunch" about ${trade.issuer.ticker || trade.issuer.name}`,
      },
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} at breakfast table, hiding newspaper with ${trade.issuer.ticker} headline, spouse holding coffee mug labeled "TOTALLY MY IDEA", suburban kitchen, morning light`,
        caption: `${trade.politician.name}'s spouse: "I make my own investment decisions"`,
      },
    ]),
  },
  {
    // Joint trade
    condition: (trade: Trade) => trade.owner === 'Joint',
    template: (trade: Trade) => ({
      imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} and spouse doing synchronized trading on dual computers, matching outfits, partnership aesthetic, ${trade.issuer.ticker} charts on screens, teamwork pose`,
      caption: `${trade.politician.name}: A family that trades ${trade.issuer.ticker} together...`,
    }),
  },

  // ===== DEFENSE/MILITARY =====
  {
    // Boeing/Defense - patriotic military industrial
    condition: (trade: Trade) => trade.issuer.ticker === 'BA' || trade.issuer.ticker === 'LMT' || trade.issuer.ticker === 'RTX' || trade.issuer.ticker === 'NOC' || trade.issuer.ticker === 'GD' || trade.issuer.name.includes('Boeing') || trade.issuer.name.includes('Lockheed') || trade.issuer.name.includes('Raytheon'),
    template: (trade: Trade) => pickRandom([
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} standing on aircraft carrier deck, fighter jets in background, American flag waving dramatically, ${trade.issuer.name} logo on aircraft, sunset patriotic lighting, expression of solemn duty`,
        caption: `${trade.politician.name} ${trade.type === 'buy' ? 'invests in' : 'divests from'} national security`,
      },
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} in Pentagon war room, surrounded by generals, pointing at map with ${trade.issuer.ticker} defense contracts marked, serious briefing aesthetic, dramatic overhead lighting`,
        caption: `${trade.politician.name}: "For America... and my portfolio"`,
      },
    ]),
  },

  // ===== BIG TECH SCENARIOS =====
  {
    // Apple
    condition: (trade: Trade) => trade.issuer.ticker === 'AAPL' || trade.issuer.name.includes('Apple'),
    template: (trade: Trade) => ({
      imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} in Apple Store, hugging giant iPhone like precious object, minimalist white aesthetic, glass architecture, reverential expression, blue shirt staff in background`,
      caption: `${trade.politician.name} ${trade.type === 'buy' ? 'thinks different' : 'thinks again'} about AAPL`,
    }),
  },
  {
    // Microsoft
    condition: (trade: Trade) => trade.issuer.ticker === 'MSFT' || trade.issuer.name.includes('Microsoft'),
    template: (trade: Trade) => ({
      imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} in Microsoft campus cafeteria, Surface tablet in hand, Azure cloud logo floating overhead, corporate blue aesthetic, Satya Nadella portrait visible`,
      caption: `${trade.politician.name} ${trade.type === 'buy' ? 'embraces' : 'updates away from'} the Microsoft cloud`,
    }),
  },
  {
    // Google/Alphabet
    condition: (trade: Trade) => trade.issuer.ticker === 'GOOGL' || trade.issuer.ticker === 'GOOG' || trade.issuer.name.includes('Google') || trade.issuer.name.includes('Alphabet'),
    template: (trade: Trade) => ({
      imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} sliding down Google campus slide, colorful ball pit below, playful tech campus aesthetic, search bar showing "${trade.politician.name} ${trade.issuer.ticker} trade", whimsical lighting`,
      caption: `${trade.politician.name} just Googled "${trade.type === 'buy' ? 'how to buy' : 'when to sell'} GOOGL"`,
    }),
  },
  {
    // Amazon
    condition: (trade: Trade) => trade.issuer.ticker === 'AMZN' || trade.issuer.name.includes('Amazon'),
    template: (trade: Trade) => ({
      imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} in Amazon warehouse, surrounded by delivery boxes, Prime logo everywhere, robot workers in background, package labeled "${trade.issuer.ticker} SHARES" in hands`,
      caption: `${trade.politician.name} gets 2-day delivery on ${trade.type === 'buy' ? 'AMZN gains' : 'selling AMZN'}`,
    }),
  },
  {
    // Meta
    condition: (trade: Trade) => trade.issuer.ticker === 'META' || trade.issuer.name.includes('Meta') || trade.issuer.name.includes('Facebook'),
    template: (trade: Trade) => ({
      imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} wearing VR headset in metaverse, floating in digital void, virtual stock charts around them, blue infinity logo, surreal digital aesthetic`,
      caption: `${trade.politician.name} enters the META-verse to ${trade.type}`,
    }),
  },

  // ===== GENERIC BUY SCENARIOS (varied) =====
  {
    condition: (trade: Trade) => trade.type === 'buy',
    template: (trade: Trade) => pickRandom([
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} playing chess in ornate library, chess pieces replaced with corporate logos, thoughtful expression, hand hovering over ${trade.issuer.ticker} piece, opponent's king about to fall, warm fireplace lighting, Capitol building model visible`,
        caption: `${trade.politician.name} makes their move on ${trade.issuer.ticker || trade.issuer.name}`,
      },
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} at auction house, paddle raised high, bidding war scene, ${trade.issuer.ticker} displayed on easel, wealthy collectors in background, dramatic spotlight on politician`,
        caption: `${trade.politician.name} wins the bid for ${trade.issuer.ticker}`,
      },
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} planting money tree in garden, ${trade.issuer.ticker} leaves growing, watering can labeled "INSIDER INFO" nearby, nurturing expression, sunrise lighting`,
        caption: `${trade.politician.name} plants the ${trade.issuer.ticker} seed`,
      },
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} in fishing boat on calm lake, reeling in giant fish made of ${trade.issuer.ticker} stock certificates, peaceful dawn lighting, satisfied expression`,
        caption: `${trade.politician.name} lands a big one: ${trade.issuer.ticker}`,
      },
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} at crystal ball reading table, fortune teller aesthetic, ${trade.issuer.ticker} stock chart glowing in ball, mystical purple lighting, knowing smile`,
        caption: `${trade.politician.name} sees ${trade.issuer.ticker} in their future`,
      },
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} shooting arrow at target, bullseye is ${trade.issuer.ticker} logo, archery range, Olympic precision pose, arrow mid-flight toward center`,
        caption: `${trade.politician.name} takes aim at ${trade.issuer.ticker}`,
      },
    ]),
  },

  // ===== GENERIC SELL SCENARIOS (varied) =====
  {
    condition: (trade: Trade) => trade.type === 'sell',
    template: (trade: Trade) => pickRandom([
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} at luxury casino cashier window, sliding ${trade.issuer.ticker} stock certificates across counter, receiving stacks of cash, satisfied smirk, "WINNER" neon signs, Vegas glamour aesthetic`,
        caption: `${trade.politician.name} cashes out of ${trade.issuer.ticker}. House always wins.`,
      },
      {
        imagePrompt: `${STYLE}. Thriller movie poster style, ${getPoliticianDescription(trade)} bursting through exit door into daylight, ${trade.issuer.name} building behind them, briefcase in hand, papers flying everywhere, looking back dramatically`,
        caption: `${trade.politician.name} exits ${trade.issuer.ticker} stage left`,
      },
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} parachuting from burning airplane labeled "${trade.issuer.ticker}", dramatic sky, relieved expression, golden parachute literally made of gold`,
        caption: `${trade.politician.name} deploys golden parachute from ${trade.issuer.ticker}`,
      },
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} at garage sale, selling ${trade.issuer.ticker} shares from folding table, "EVERYTHING MUST GO" sign, suburban driveway, casual weekend attire over formal wear`,
        caption: `${trade.politician.name}'s ${trade.issuer.ticker} fire sale`,
      },
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} on sinking ship labeled "${trade.issuer.ticker}", climbing into lifeboat first, other passengers still on deck, ocean storm, dramatic rescue lighting`,
        caption: `${trade.politician.name} knows when to abandon ship`,
      },
      {
        imagePrompt: `${STYLE}. ${getPoliticianDescription(trade)} at magic show, making ${trade.issuer.ticker} shares disappear into top hat, audience amazed, poof of smoke, spotlight on magician`,
        caption: `${trade.politician.name}: "Now you see ${trade.issuer.ticker}, now you don't"`,
      },
    ]),
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
