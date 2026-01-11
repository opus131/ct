import type { SportsTeam } from './types';
import { politicians } from './politicians';

type PoliticianBio = {
  biography: string;
  birthDate: string;
  birthPlace: string;
  education: string[];
  careerStart: number;
  sportsTeams?: SportsTeam[];
  twitterHandle?: string;
};

const ESPN_NFL = 'https://a.espncdn.com/i/teamlogos/nfl/500';
const ESPN_MLB = 'https://a.espncdn.com/i/teamlogos/mlb/500';
const ESPN_NCAA = 'https://a.espncdn.com/i/teamlogos/ncaa/500';

export const politicianBios: Record<string, PoliticianBio> = {
  // Nancy Pelosi - Well documented 49ers and Giants fan
  P000197: {
    biography:
      'Nancy Patricia Pelosi is an American politician serving as the U.S. representative for California\'s 11th congressional district. She served as the 52nd Speaker of the House from 2007 to 2011 and again from 2019 to 2023, making her the first woman to hold this position. A member of the Democratic Party, Pelosi is the highest-ranking elected woman in United States history.',
    birthDate: '1940-03-26',
    birthPlace: 'Baltimore, Maryland',
    education: [
      'Trinity College (now Trinity Washington University), B.A. Political Science, 1962',
    ],
    careerStart: 1987,
    sportsTeams: [
      { name: 'San Francisco 49ers', league: 'NFL', logoUrl: `${ESPN_NFL}/sf.png` },
      { name: 'San Francisco Giants', league: 'MLB', logoUrl: `${ESPN_MLB}/sf.png` },
    ],
    twitterHandle: 'SpeakerPelosi',
  },

  // Tommy Tuberville - Former Auburn head football coach
  T000278: {
    biography:
      'Thomas Hawley Tuberville is an American politician and former college football coach serving as the junior United States senator from Alabama since 2021. Before entering politics, Tuberville was the head football coach at Ole Miss, Auburn, Texas Tech, and Cincinnati. At Auburn, he led the Tigers to an undefeated season in 2004 and six consecutive wins over rival Alabama.',
    birthDate: '1954-09-18',
    birthPlace: 'Camden, Arkansas',
    education: [
      'Southern Arkansas University, B.S. Physical Education, 1976',
    ],
    careerStart: 2021,
    sportsTeams: [
      { name: 'Auburn Tigers', league: 'NCAA', logoUrl: `${ESPN_NCAA}/2.png` },
    ],
    twitterHandle: 'TTuberville',
  },

  // John Fetterman - Known Steelers fan
  F000479: {
    biography:
      'John Karl Fetterman is an American politician serving as the junior United States senator from Pennsylvania since 2023. A member of the Democratic Party, he served as the 34th lieutenant governor of Pennsylvania from 2019 to 2023 and as mayor of Braddock, Pennsylvania from 2006 to 2019. At 6\'8", he is the tallest sitting U.S. senator.',
    birthDate: '1969-08-15',
    birthPlace: 'West Reading, Pennsylvania',
    education: [
      'Albright College, B.A. Finance, 1991',
      'University of Connecticut, MBA, 1993',
      'Harvard Kennedy School, MPP, 1999',
    ],
    careerStart: 2006,
    sportsTeams: [
      { name: 'Pittsburgh Steelers', league: 'NFL', logoUrl: `${ESPN_NFL}/pit.png` },
    ],
    twitterHandle: 'JohnFetterman',
  },

  // Lindsey Graham - South Carolina teams
  G000359: {
    biography:
      'Lindsey Olin Graham is an American politician and attorney serving as the senior United States senator from South Carolina since 2003. A member of the Republican Party, he served in the South Carolina House of Representatives and the U.S. House of Representatives before his Senate election. Graham served in the U.S. Air Force and Air Force Reserve as a judge advocate.',
    birthDate: '1955-07-09',
    birthPlace: 'Central, South Carolina',
    education: [
      'University of South Carolina, B.A. Psychology, 1977',
      'University of South Carolina School of Law, J.D., 1981',
    ],
    careerStart: 1993,
    sportsTeams: [
      { name: 'South Carolina Gamecocks', league: 'NCAA', logoUrl: `${ESPN_NCAA}/2579.png` },
      { name: 'Carolina Panthers', league: 'NFL', logoUrl: `${ESPN_NFL}/car.png` },
    ],
    twitterHandle: 'LindseyGrahamSC',
  },

  // Dan Crenshaw - Houston area representative
  C001120: {
    biography:
      'Daniel Reed Crenshaw is an American politician and former United States Navy SEAL officer serving as the U.S. representative for Texas\'s 2nd congressional district since 2019. Crenshaw served in the Navy for ten years, deploying five times and earning two Bronze Stars. He lost his right eye to an IED blast in Afghanistan in 2012.',
    birthDate: '1984-03-14',
    birthPlace: 'Aberdeen, Scotland',
    education: [
      'Tufts University, B.A. International Relations, 2006',
      'Harvard Kennedy School, MPA, 2017',
    ],
    careerStart: 2019,
    sportsTeams: [
      { name: 'Houston Texans', league: 'NFL', logoUrl: `${ESPN_NFL}/hou.png` },
    ],
    twitterHandle: 'RepDanCrenshaw',
  },

  // Virginia Foxx - North Carolina
  F000450: {
    biography:
      'Virginia Ann Foxx is an American politician serving as the U.S. representative for North Carolina\'s 5th congressional district since 2005. A member of the Republican Party, she chairs the House Committee on Education and the Workforce. Before Congress, she served in the North Carolina Senate and on the Watauga County Board of Education.',
    birthDate: '1943-06-29',
    birthPlace: 'The Bronx, New York',
    education: [
      'University of North Carolina at Chapel Hill, A.B., 1968',
      'University of North Carolina at Chapel Hill, M.A.C.T., 1972',
      'University of North Carolina at Greensboro, Ed.D., 1985',
    ],
    careerStart: 2005,
    sportsTeams: [
      { name: 'North Carolina Tar Heels', league: 'NCAA', logoUrl: `${ESPN_NCAA}/153.png` },
      { name: 'Carolina Panthers', league: 'NFL', logoUrl: `${ESPN_NFL}/car.png` },
    ],
    twitterHandle: 'virginiafoxx',
  },

  // Tim Moore - North Carolina
  M001236: {
    biography:
      'Tim Moore is an American politician serving as the U.S. representative for North Carolina\'s 14th congressional district. A member of the Republican Party, he previously served as Speaker of the North Carolina House of Representatives from 2015 to 2024, making him the longest-serving Speaker in North Carolina history.',
    birthDate: '1969-11-21',
    birthPlace: 'Kings Mountain, North Carolina',
    education: [
      'University of North Carolina at Chapel Hill, B.A., 1992',
      'University of North Carolina School of Law, J.D., 1995',
    ],
    careerStart: 2025,
    sportsTeams: [
      { name: 'North Carolina Tar Heels', league: 'NCAA', logoUrl: `${ESPN_NCAA}/153.png` },
      { name: 'Carolina Panthers', league: 'NFL', logoUrl: `${ESPN_NFL}/car.png` },
    ],
    twitterHandle: 'NCHouseSpeaker',
  },

  // Jefferson Shreve - Indiana
  S001229: {
    biography:
      'Jefferson Shreve is an American businessman and politician serving as the U.S. representative for Indiana\'s 6th congressional district since 2025. A member of the Republican Party, Shreve founded Storage Express, a self-storage company with over 100 locations. He previously served on the Indianapolis City-County Council.',
    birthDate: '1966-03-15',
    birthPlace: 'Indianapolis, Indiana',
    education: [
      'DePauw University, B.A., 1988',
      'Indiana University Kelley School of Business, MBA, 1993',
    ],
    careerStart: 2025,
    sportsTeams: [
      { name: 'Indianapolis Colts', league: 'NFL', logoUrl: `${ESPN_NFL}/ind.png` },
      { name: 'Indiana Hoosiers', league: 'NCAA', logoUrl: `${ESPN_NCAA}/84.png` },
    ],
    twitterHandle: 'JeffShreve',
  },

  // Byron Donalds - Florida
  D000032: {
    biography:
      'Byron Lowell Donalds is an American politician serving as the U.S. representative for Florida\'s 19th congressional district since 2021. A member of the Republican Party, Donalds previously served in the Florida House of Representatives. Before politics, he worked in finance, banking, and insurance.',
    birthDate: '1978-10-28',
    birthPlace: 'Brooklyn, New York',
    education: [
      'Florida State University, B.S. Finance, 2002',
    ],
    careerStart: 2021,
    sportsTeams: [
      { name: 'Florida State Seminoles', league: 'NCAA', logoUrl: `${ESPN_NCAA}/52.png` },
      { name: 'Miami Dolphins', league: 'NFL', logoUrl: `${ESPN_NFL}/mia.png` },
    ],
    twitterHandle: 'ByronDonalds',
  },

  // Josh Gottheimer - New Jersey
  G000583: {
    biography:
      'Joshua Seth Gottheimer is an American politician serving as the U.S. representative for New Jersey\'s 5th congressional district since 2017. A member of the Democratic Party, Gottheimer is a co-chair of the bipartisan Problem Solvers Caucus. He previously served as a speechwriter for President Bill Clinton.',
    birthDate: '1975-03-08',
    birthPlace: 'Livingston, New Jersey',
    education: [
      'University of Pennsylvania, B.A., 1997',
      'Harvard Law School, J.D., 2004',
    ],
    careerStart: 2017,
    sportsTeams: [
      { name: 'New York Giants', league: 'NFL', logoUrl: `${ESPN_NFL}/nyg.png` },
      { name: 'New York Yankees', league: 'MLB', logoUrl: `${ESPN_MLB}/nyy.png` },
    ],
    twitterHandle: 'RepJoshG',
  },

  // Ro Khanna - California (Silicon Valley)
  K000389: {
    biography:
      'Rohit "Ro" Khanna is an American politician and lawyer serving as the U.S. representative for California\'s 17th congressional district since 2017. A member of the Democratic Party, Khanna represents much of Silicon Valley. He previously served as Deputy Assistant Secretary of Commerce under President Obama.',
    birthDate: '1976-09-13',
    birthPlace: 'Philadelphia, Pennsylvania',
    education: [
      'University of Chicago, B.A. Economics, 1998',
      'Yale Law School, J.D., 2001',
    ],
    careerStart: 2017,
    sportsTeams: [
      { name: 'San Francisco 49ers', league: 'NFL', logoUrl: `${ESPN_NFL}/sf.png` },
      { name: 'Golden State Warriors', league: 'NBA', logoUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png' },
    ],
    twitterHandle: 'RepRoKhanna',
  },

  // Mark Green - Tennessee
  G000545: {
    biography:
      'Mark Edward Green is an American physician, politician, and retired United States Army officer serving as the U.S. representative for Tennessee\'s 7th congressional district since 2019. A West Point graduate, Green served in the 160th Special Operations Aviation Regiment and was the flight surgeon in the operation that captured Saddam Hussein.',
    birthDate: '1964-11-08',
    birthPlace: 'Jacksonville, Florida',
    education: [
      'United States Military Academy (West Point), B.S., 1986',
      'Wright State University School of Medicine, M.D., 1999',
    ],
    careerStart: 2019,
    sportsTeams: [
      { name: 'Tennessee Titans', league: 'NFL', logoUrl: `${ESPN_NFL}/ten.png` },
      { name: 'Tennessee Volunteers', league: 'NCAA', logoUrl: `${ESPN_NCAA}/2633.png` },
    ],
    twitterHandle: 'RepMarkGreen',
  },
};

// Generate a URL-safe slug from team name
export function getTeamSlug(team: SportsTeam): string {
  const nameSlug = team.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${team.league.toLowerCase()}-${nameSlug}`;
}

// Parse a team slug back into league and name parts
export function parseTeamSlug(slug: string): { league: string; nameSlug: string } | null {
  const match = slug.match(/^(nfl|mlb|nba|nhl|ncaa|mls)-(.+)$/i);
  if (!match) return null;
  return { league: match[1].toUpperCase(), nameSlug: match[2] };
}

// Parse volume string to number (e.g., "13.89M" -> 13890000)
function parseVolume(volume: string): number {
  const match = volume.match(/^([\d.]+)([KMB])?$/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const suffix = match[2]?.toUpperCase();
  if (suffix === 'K') return num * 1000;
  if (suffix === 'M') return num * 1000000;
  if (suffix === 'B') return num * 1000000000;
  return num;
}

// Format number to volume string (e.g., 13890000 -> "13.89M")
function formatVolume(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Aggregate stats for a team's political supporters
export type TeamAggregateStats = {
  totalTrades: number;
  totalFilings: number;
  totalVolume: string;
  totalVolumeNum: number;
  democratCount: number;
  republicanCount: number;
  avgTradesPerPolitician: number;
};

// Get all unique sports teams with their supporting politicians
export type TeamWithPoliticians = {
  team: SportsTeam;
  slug: string;
  politicians: Array<{
    id: string;
    name: string;
    party: string;
    chamber: string;
    state: string;
    photoUrl: string;
    trades: number;
    filings: number;
    volume: string;
  }>;
  aggregateStats: TeamAggregateStats;
};

export function getAllTeamsWithPoliticians(): TeamWithPoliticians[] {
  const teamMap = new Map<string, Omit<TeamWithPoliticians, 'aggregateStats'>>();

  for (const [politicianId, bio] of Object.entries(politicianBios)) {
    if (!bio.sportsTeams) continue;

    const politician = politicians.find((p) => p.id === politicianId);
    if (!politician) continue;

    for (const team of bio.sportsTeams) {
      const slug = getTeamSlug(team);

      if (!teamMap.has(slug)) {
        teamMap.set(slug, {
          team,
          slug,
          politicians: [],
        });
      }

      teamMap.get(slug)!.politicians.push({
        id: politician.id,
        name: politician.name,
        party: politician.party,
        chamber: politician.chamber,
        state: politician.state,
        photoUrl: politician.photoUrl,
        trades: politician.trades,
        filings: politician.filings,
        volume: politician.volume,
      });
    }
  }

  // Calculate aggregate stats for each team
  const teamsWithStats: TeamWithPoliticians[] = Array.from(teamMap.values()).map((teamData) => {
    const totalTrades = teamData.politicians.reduce((sum, p) => sum + p.trades, 0);
    const totalFilings = teamData.politicians.reduce((sum, p) => sum + p.filings, 0);
    const totalVolumeNum = teamData.politicians.reduce((sum, p) => sum + parseVolume(p.volume), 0);
    const democratCount = teamData.politicians.filter((p) => p.party === 'Democrat').length;
    const republicanCount = teamData.politicians.filter((p) => p.party === 'Republican').length;

    return {
      ...teamData,
      aggregateStats: {
        totalTrades,
        totalFilings,
        totalVolume: formatVolume(totalVolumeNum),
        totalVolumeNum,
        democratCount,
        republicanCount,
        avgTradesPerPolitician: teamData.politicians.length > 0
          ? Math.round(totalTrades / teamData.politicians.length)
          : 0,
      },
    };
  });

  // Sort by number of politicians (most popular teams first)
  return teamsWithStats.sort((a, b) => b.politicians.length - a.politicians.length);
}

export function getTeamBySlug(slug: string): TeamWithPoliticians | null {
  const allTeams = getAllTeamsWithPoliticians();
  return allTeams.find((t) => t.slug === slug) || null;
}
