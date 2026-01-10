import type { SportsLeague } from '../data/types';

export type ESPNTeamStats = {
  id: string;
  name: string;
  abbreviation: string;
  record: string;
  wins: number;
  losses: number;
  ties?: number;
  winPct: string;
  standing: string;
  conference?: string;
  division?: string;
  streak?: string;
  homeRecord?: string;
  awayRecord?: string;
};

const LEAGUE_ENDPOINTS: Record<SportsLeague, string> = {
  NFL: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams',
  NBA: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams',
  MLB: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams',
  NHL: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams',
  NCAA: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams',
  MLS: 'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/teams',
};

// Normalize team name for matching
function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/ers$/, '') // 49ers -> 49
    .replace(/s$/, ''); // Remove trailing 's' for plurals
}

// Find best matching team from ESPN data
function findTeamMatch(
  espnTeams: Array<{ team: { displayName: string; shortDisplayName: string; abbreviation: string; id: string } }>,
  searchName: string
): { team: { displayName: string; shortDisplayName: string; abbreviation: string; id: string } } | null {
  const normalizedSearch = normalizeTeamName(searchName);

  // Try exact match first
  let match = espnTeams.find(
    (t) =>
      normalizeTeamName(t.team.displayName) === normalizedSearch ||
      normalizeTeamName(t.team.shortDisplayName) === normalizedSearch
  );

  // Try partial match
  if (!match) {
    match = espnTeams.find(
      (t) =>
        normalizeTeamName(t.team.displayName).includes(normalizedSearch) ||
        normalizedSearch.includes(normalizeTeamName(t.team.displayName)) ||
        normalizeTeamName(t.team.shortDisplayName).includes(normalizedSearch)
    );
  }

  return match || null;
}

export async function fetchTeamStats(
  teamName: string,
  league: SportsLeague
): Promise<ESPNTeamStats | null> {
  const endpoint = LEAGUE_ENDPOINTS[league];
  if (!endpoint) return null;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) return null;

    const data = await response.json();
    const teams = data.sports?.[0]?.leagues?.[0]?.teams || [];

    const matchedTeam = findTeamMatch(teams, teamName);
    if (!matchedTeam) return null;

    // Fetch detailed team info
    const teamId = matchedTeam.team.id;
    const teamResponse = await fetch(`${endpoint}/${teamId}`);
    if (!teamResponse.ok) {
      // Return basic info if detailed fetch fails
      return {
        id: teamId,
        name: matchedTeam.team.displayName,
        abbreviation: matchedTeam.team.abbreviation,
        record: 'N/A',
        wins: 0,
        losses: 0,
        winPct: 'N/A',
        standing: 'N/A',
      };
    }

    const teamData = await teamResponse.json();
    const team = teamData.team;
    const record = team.record?.items?.[0] || {};
    const stats = record.stats || [];

    // Extract stats
    const wins = stats.find((s: { name: string }) => s.name === 'wins')?.value || 0;
    const losses = stats.find((s: { name: string }) => s.name === 'losses')?.value || 0;
    const ties = stats.find((s: { name: string }) => s.name === 'ties')?.value;
    const winPctStat = stats.find((s: { name: string }) => s.name === 'winPercent')?.value;

    return {
      id: team.id,
      name: team.displayName,
      abbreviation: team.abbreviation,
      record: record.summary || `${wins}-${losses}${ties !== undefined ? `-${ties}` : ''}`,
      wins,
      losses,
      ties,
      winPct: winPctStat ? `${(winPctStat * 100).toFixed(1)}%` : 'N/A',
      standing: team.standingSummary || 'N/A',
      conference: team.groups?.parent?.name,
      division: team.groups?.name,
      streak: stats.find((s: { name: string }) => s.name === 'streak')?.displayValue,
      homeRecord: stats.find((s: { name: string }) => s.name === 'homeRecord')?.displayValue,
      awayRecord: stats.find((s: { name: string }) => s.name === 'awayRecord')?.displayValue,
    };
  } catch (error) {
    console.error('Error fetching ESPN team stats:', error);
    return null;
  }
}
