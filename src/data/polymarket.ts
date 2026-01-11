const GAMMA_API = 'https://gamma-api.polymarket.com';

export type PolymarketOutcome = {
  name: string;
  price: number;
};

export type PolymarketMarket = {
  id: string;
  question: string;
  slug: string;
  outcomes: PolymarketOutcome[];
  volume: number;
  liquidity: number;
  endDate: string;
  image?: string;
  url: string;
};

export type PolymarketEvent = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  volume: number;
  liquidity: number;
  markets: PolymarketMarket[];
  url: string;
};

type GammaMarket = {
  id: string;
  question: string;
  slug: string;
  outcomes: string;
  outcomePrices: string;
  volume: string;
  liquidity: string;
  endDate: string;
  image?: string;
};

type GammaEvent = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  volume: number;
  liquidity: number;
  markets: GammaMarket[];
};

function parseMarket(market: GammaMarket): PolymarketMarket {
  const outcomes = JSON.parse(market.outcomes || '["Yes", "No"]') as string[];
  const prices = JSON.parse(market.outcomePrices || '[0.5, 0.5]') as string[];

  return {
    id: market.id,
    question: market.question,
    slug: market.slug,
    outcomes: outcomes.map((name, i) => ({
      name,
      price: parseFloat(prices[i]) || 0,
    })),
    volume: parseFloat(market.volume) || 0,
    liquidity: parseFloat(market.liquidity) || 0,
    endDate: market.endDate,
    image: market.image,
    url: `https://polymarket.com/event/${market.slug}`,
  };
}

function parseEvent(event: GammaEvent): PolymarketEvent {
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    description: event.description,
    image: event.image,
    volume: event.volume,
    liquidity: event.liquidity,
    markets: event.markets?.map(parseMarket) || [],
    url: `https://polymarket.com/event/${event.slug}`,
  };
}

// Political tag IDs from Polymarket (for future use)
export const POLITICAL_TAGS = [
  '24', // USA Election
  '126', // Trump
  '766', // U.S. Congress
  '100199', // Senate
  '487', // House of Representatives
  '759', // U.S. Supreme Court
  '871', // Vice President
];

export async function fetchPoliticalMarkets(limit = 20): Promise<PolymarketEvent[]> {
  try {
    const params = new URLSearchParams({
      active: 'true',
      closed: 'false',
      limit: limit.toString(),
      order: 'volume24hr',
      ascending: 'false',
    });

    const response = await fetch(`${GAMMA_API}/events?${params}`);
    if (!response.ok) throw new Error('Failed to fetch markets');

    const events = (await response.json()) as GammaEvent[];

    // Filter for political/policy related events
    const politicalKeywords = [
      'trump',
      'biden',
      'congress',
      'senate',
      'house',
      'president',
      'election',
      'democrat',
      'republican',
      'doge',
      'elon',
      'deficit',
      'deport',
      'tariff',
      'fed',
      'government',
      'bill',
      'law',
      'policy',
    ];

    return events
      .filter((event) => {
        const text = `${event.title} ${event.description}`.toLowerCase();
        return politicalKeywords.some((keyword) => text.includes(keyword));
      })
      .map(parseEvent);
  } catch (error) {
    console.error('Error fetching political markets:', error);
    return [];
  }
}

export async function fetchMarketsForPolitician(
  politicianName: string
): Promise<PolymarketEvent[]> {
  try {
    // Search by politician name in the title
    const nameParts = politicianName.toLowerCase().split(' ');
    const lastName = nameParts[nameParts.length - 1];

    const params = new URLSearchParams({
      active: 'true',
      closed: 'false',
      limit: '50',
    });

    const response = await fetch(`${GAMMA_API}/events?${params}`);
    if (!response.ok) throw new Error('Failed to fetch markets');

    const events = (await response.json()) as GammaEvent[];

    // Filter events that mention this politician
    return events
      .filter((event) => {
        const text = `${event.title} ${event.description}`.toLowerCase();
        // Match full name or last name
        return (
          text.includes(politicianName.toLowerCase()) ||
          text.includes(lastName)
        );
      })
      .map(parseEvent);
  } catch (error) {
    console.error('Error fetching markets for politician:', error);
    return [];
  }
}

export function formatOdds(price: number): string {
  return `${Math.round(price * 100)}%`;
}

export function formatVolume(volume: number): string {
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(1)}M`;
  }
  if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(0)}K`;
  }
  return `$${volume.toFixed(0)}`;
}

// Real data from Polymarket API (fetched January 2026)
const MOCK_POLITICAL_MARKETS: PolymarketEvent[] = [
  {
    id: '16282',
    title: 'How many people will Trump deport in 2025?',
    slug: 'how-many-people-will-trump-deport-in-2025',
    description: 'This market tracks Trump administration deportation numbers for 2025.',
    image: 'https://polymarket-upload.s3.us-east-2.amazonaws.com/how-many-people-will-trump-deport-in-2025-0f3mpbc_YDbk.jpg',
    volume: 4403626,
    liquidity: 890000,
    markets: [
      {
        id: '16282a',
        question: 'Will Trump deport 250,000-500,000 people?',
        slug: 'trump-deport-250k-500k',
        outcomes: [
          { name: 'Yes', price: 0.893 },
          { name: 'No', price: 0.107 },
        ],
        volume: 1041052,
        liquidity: 450000,
        endDate: '2025-12-31',
        url: 'https://polymarket.com/event/how-many-people-will-trump-deport-in-2025',
      },
    ],
    url: 'https://polymarket.com/event/how-many-people-will-trump-deport-in-2025',
  },
  {
    id: '17823',
    title: 'How much spending will DOGE cut in 2025?',
    slug: 'how-much-spending-will-elon-and-doge-cut-in-2025',
    description: 'Will Elon Musk and DOGE achieve significant federal spending cuts?',
    image: 'https://polymarket-upload.s3.us-east-2.amazonaws.com/how-much-spending-will-elon-and-doge-cut-in-2025-bSxs-4-7j9B7.png',
    volume: 2311442,
    liquidity: 560000,
    markets: [
      {
        id: '17823a',
        question: 'Will Elon and DOGE cut less than $50b in federal spending in 2025?',
        slug: 'doge-under-50b',
        outcomes: [
          { name: 'Yes', price: 0.992 },
          { name: 'No', price: 0.008 },
        ],
        volume: 315608,
        liquidity: 280000,
        endDate: '2025-12-31',
        url: 'https://polymarket.com/event/how-much-spending-will-elon-and-doge-cut-in-2025',
      },
    ],
    url: 'https://polymarket.com/event/how-much-spending-will-elon-and-doge-cut-in-2025',
  },
  {
    id: '17576',
    title: 'Will Trump & Elon reduce the deficit in 2025?',
    slug: 'will-trump-elon-reduce-the-deficit-in-2025',
    description: 'Will the federal deficit decrease under Trump and Elon in 2025?',
    image: 'https://polymarket-upload.s3.us-east-2.amazonaws.com/will-trump-elon-reduce-the-deficit-in-2025-december-yoy-WloNDhtofy7s.jpg',
    volume: 194501,
    liquidity: 340000,
    markets: [
      {
        id: '17576a',
        question: 'Will Trump & Elon reduce the deficit in 2025?',
        slug: 'trump-elon-deficit',
        outcomes: [
          { name: 'Yes', price: 0.0735 },
          { name: 'No', price: 0.9265 },
        ],
        volume: 194501,
        liquidity: 340000,
        endDate: '2025-12-31',
        url: 'https://polymarket.com/event/will-trump-elon-reduce-the-deficit-in-2025',
      },
    ],
    url: 'https://polymarket.com/event/will-trump-elon-reduce-the-deficit-in-2025',
  },
  {
    id: '45883',
    title: 'Fed decision in January 2026',
    slug: 'fed-decision-in-january',
    description: 'What will the Federal Reserve decide on interest rates in January 2026?',
    image: 'https://polymarket-upload.s3.us-east-2.amazonaws.com/jerome+powell+glasses1.png',
    volume: 241011651,
    liquidity: 16794261,
    markets: [
      {
        id: '601699',
        question: 'No change in Fed interest rates after January 2026 meeting?',
        slug: 'fed-no-change-jan',
        outcomes: [
          { name: 'Yes', price: 0.9585 },
          { name: 'No', price: 0.0415 },
        ],
        volume: 22044129,
        liquidity: 833734,
        endDate: '2026-01-28',
        url: 'https://polymarket.com/event/fed-decision-in-january',
      },
    ],
    url: 'https://polymarket.com/event/fed-decision-in-january',
  },
  {
    id: '16171',
    title: 'Will 2025 be the hottest year on record?',
    slug: 'will-2025-be-the-hottest-year-on-record',
    description: 'Climate prediction market for 2025 temperature records.',
    image: 'https://polymarket-upload.s3.us-east-2.amazonaws.com/earth+on+fire.png',
    volume: 2203821,
    liquidity: 180000,
    markets: [
      {
        id: '16171a',
        question: 'Will 2025 be the hottest year on record?',
        slug: 'hottest-2025',
        outcomes: [
          { name: 'Yes', price: 0.0025 },
          { name: 'No', price: 0.9975 },
        ],
        volume: 2203821,
        liquidity: 180000,
        endDate: '2025-12-31',
        url: 'https://polymarket.com/event/will-2025-be-the-hottest-year-on-record',
      },
    ],
    url: 'https://polymarket.com/event/will-2025-be-the-hottest-year-on-record',
  },
  {
    id: '22862',
    title: 'How much revenue will the U.S. raise from tariffs in 2025?',
    slug: 'how-much-revenue-will-the-us-raise-from-tariffs-in-2025',
    description: 'Tariff revenue predictions for 2025 under Trump administration.',
    image: 'https://polymarket-upload.s3.us-east-2.amazonaws.com/how-much-revenue-will-the-us-raise-from-tariffs-in-2025-lUbEhM1AK-xa.jpg',
    volume: 2487970,
    liquidity: 400000,
    markets: [
      {
        id: '22862a',
        question: 'Will the U.S. collect between $100b and $200b in tariff revenue in 2025?',
        slug: 'tariffs-100-200b',
        outcomes: [
          { name: 'Yes', price: 0.30 },
          { name: 'No', price: 0.70 },
        ],
        volume: 762122,
        liquidity: 150000,
        endDate: '2025-12-31',
        url: 'https://polymarket.com/event/how-much-revenue-will-the-us-raise-from-tariffs-in-2025',
      },
    ],
    url: 'https://polymarket.com/event/how-much-revenue-will-the-us-raise-from-tariffs-in-2025',
  },
  {
    id: '31759',
    title: 'Russia x Ukraine ceasefire by March 31, 2026?',
    slug: 'russia-x-ukraine-ceasefire-by-march-31-2026',
    description: 'Will Russia and Ukraine agree to a ceasefire by March 2026?',
    image: 'https://polymarket-upload.s3.us-east-2.amazonaws.com/russia-x-ukraine-ceasefire-before-july-GSNGh26whPic.jpg',
    volume: 7979698,
    liquidity: 1500000,
    markets: [
      {
        id: '31759a',
        question: 'Russia x Ukraine ceasefire by March 31, 2026?',
        slug: 'russia-ukraine-ceasefire',
        outcomes: [
          { name: 'Yes', price: 0.155 },
          { name: 'No', price: 0.845 },
        ],
        volume: 7979698,
        liquidity: 1500000,
        endDate: '2026-03-31',
        url: 'https://polymarket.com/event/russia-x-ukraine-ceasefire-by-march-31-2026',
      },
    ],
    url: 'https://polymarket.com/event/russia-x-ukraine-ceasefire-by-march-31-2026',
  },
  {
    id: '31195',
    title: 'Putin out as President of Russia by end of 2026?',
    slug: 'putin-out-before-2027',
    description: 'Will Vladimir Putin leave office before 2027?',
    image: 'https://polymarket-upload.s3.us-east-2.amazonaws.com/putin-out-as-president-of-russia-in-2025-nWuurkC8qfbi.jpg',
    volume: 1374540,
    liquidity: 350000,
    markets: [
      {
        id: '31195a',
        question: 'Putin out as President of Russia by end of 2026?',
        slug: 'putin-out-2026',
        outcomes: [
          { name: 'Yes', price: 0.095 },
          { name: 'No', price: 0.905 },
        ],
        volume: 1374540,
        liquidity: 350000,
        endDate: '2026-12-31',
        url: 'https://polymarket.com/event/putin-out-before-2027',
      },
    ],
    url: 'https://polymarket.com/event/putin-out-before-2027',
  },
  {
    id: '30829',
    title: 'Democratic Presidential Nominee 2028',
    slug: 'democratic-presidential-nominee-2028',
    description: 'Who will win the 2028 Democratic presidential nomination?',
    image: 'https://polymarket-upload.s3.us-east-2.amazonaws.com/democrats+2028+donkey.png',
    volume: 458524155,
    liquidity: 50000000,
    markets: [
      {
        id: '30829aoc',
        question: 'Will Alexandria Ocasio-Cortez win the 2028 Democratic presidential nomination?',
        slug: 'aoc-2028-dem-nominee',
        outcomes: [
          { name: 'Yes', price: 0.105 },
          { name: 'No', price: 0.895 },
        ],
        volume: 2643458,
        liquidity: 500000,
        endDate: '2028-08-31',
        url: 'https://polymarket.com/event/democratic-presidential-nominee-2028',
      },
    ],
    url: 'https://polymarket.com/event/democratic-presidential-nominee-2028',
  },
  {
    id: '30829fetterman',
    title: 'John Fetterman 2028 Presidential Nomination',
    slug: 'democratic-presidential-nominee-2028-fetterman',
    description: 'Will John Fetterman win the 2028 Democratic presidential nomination?',
    image: 'https://polymarket-upload.s3.us-east-2.amazonaws.com/democrats+2028+donkey.png',
    volume: 8412100,
    liquidity: 800000,
    markets: [
      {
        id: '30829fett',
        question: 'Will John Fetterman win the 2028 Democratic presidential nomination?',
        slug: 'fetterman-2028-dem-nominee',
        outcomes: [
          { name: 'Yes', price: 0.0125 },
          { name: 'No', price: 0.9875 },
        ],
        volume: 8412100,
        liquidity: 800000,
        endDate: '2028-08-31',
        url: 'https://polymarket.com/event/democratic-presidential-nominee-2028',
      },
    ],
    url: 'https://polymarket.com/event/democratic-presidential-nominee-2028',
  },
  {
    id: '30829rokhanna',
    title: 'Ro Khanna 2028 Presidential Nomination',
    slug: 'democratic-presidential-nominee-2028-rokhanna',
    description: 'Will Ro Khanna win the 2028 Democratic presidential nomination?',
    image: 'https://polymarket-upload.s3.us-east-2.amazonaws.com/democrats+2028+donkey.png',
    volume: 1695713,
    liquidity: 200000,
    markets: [
      {
        id: '30829ro',
        question: 'Will Ro Khanna win the 2028 Democratic presidential nomination?',
        slug: 'ro-khanna-2028-dem-nominee',
        outcomes: [
          { name: 'Yes', price: 0.0185 },
          { name: 'No', price: 0.9815 },
        ],
        volume: 1695713,
        liquidity: 200000,
        endDate: '2028-08-31',
        url: 'https://polymarket.com/event/democratic-presidential-nominee-2028',
      },
    ],
    url: 'https://polymarket.com/event/democratic-presidential-nominee-2028',
  },
  {
    id: '17828',
    title: '# of federal jobs cut in 2025?',
    slug: 'of-jobs-elon-and-doge-cut-in-2025',
    description: 'How many federal employees will DOGE eliminate in 2025?',
    image: 'https://polymarket-upload.s3.us-east-2.amazonaws.com/of-jobs-elon-and-doge-cut-in-2025-kGMe7oJ1KSat.jpg',
    volume: 756355,
    liquidity: 150000,
    markets: [
      {
        id: '17828a',
        question: 'Will Elon and DOGE cut less than 50k employees in 2025?',
        slug: 'doge-jobs-under-50k',
        outcomes: [
          { name: 'Yes', price: 0.0005 },
          { name: 'No', price: 0.9995 },
        ],
        volume: 314808,
        liquidity: 75000,
        endDate: '2025-12-31',
        url: 'https://polymarket.com/event/of-jobs-elon-and-doge-cut-in-2025',
      },
    ],
    url: 'https://polymarket.com/event/of-jobs-elon-and-doge-cut-in-2025',
  },
];

export function getMockPoliticalMarkets(limit: number): PolymarketEvent[] {
  return MOCK_POLITICAL_MARKETS.slice(0, limit);
}

export function getMockMarketsForPolitician(name: string): PolymarketEvent[] {
  const lowerName = name.toLowerCase();
  return MOCK_POLITICAL_MARKETS.filter((event) => {
    const text = `${event.title} ${event.description}`.toLowerCase();
    return text.includes(lowerName) || text.includes(lowerName.split(' ').pop() || '');
  });
}
