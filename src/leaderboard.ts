// ============================================================================
// SQUAD ONE ESPORTS — TYPESCRIPT LEADERBOARD DATA MODELS & AGGREGATION ENGINE
// ============================================================================

export type RoundKind = 'QUALIFIERS' | 'FINALS' | 'GRAND_FINALS';

export type GroupFilter = 
  | 'OVERALL'
  | 'A_VS_B'
  | 'C_VS_D'
  | 'A_VS_C'
  | 'B_VS_D'
  | 'A_VS_D'
  | 'B_VS_C';

export type StandingsView = 'TOTAL' | 'MATCH_1' | 'MATCH_2' | 'MATCH_3' | 'MATCH_4' | 'MATCH_5' | 'MATCH_6';

export interface Tournament {
  id: string;
  slug: string;
  name: string;
  seasonNumber: number;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  startsAt?: string;
  endsAt?: string;
  rounds: Round[];
}

export interface Round {
  id: string;
  tournamentId: string;
  name: string;
  kind: RoundKind;
  roundNumber: number;
  groupFilter: GroupFilter;
  startsAt?: string;
  endsAt?: string;
  matches: Match[];
}

export interface Match {
  id: string;
  roundId: string;
  matchNumber: 1 | 2 | 3 | 4 | 5 | 6;
  name: string;
  mapName?: string;
  playedAt?: string;
}

export interface CombatStats {
  kills: number;
  assists: number;
  cqbKills: number;
  lrbKills: number;
  cqbDamage: number;
  lrbDamage: number;
  totalDamage: number;
}

export interface PlayerStats extends CombatStats {
  playerId: string;
  matchId: string;
}

export interface Player {
  id: string;
  teamId: string;
  displayName: string;
  jerseyNumber?: number;
  active: boolean;
  matchStats?: PlayerStats[];
}

export interface TeamStats extends CombatStats {
  teamId: string;
  matchId: string;
  placement?: number;
  placementPoints: number;
  totalPoints: number;
}

export interface TeamDetails {
  id: string;
  tournamentId: string;
  name: string;
  logoUrl?: string;
  players: Player[];
  matchStats: TeamStats[];
}

export interface LeaderboardRow extends CombatStats {
  rank: number;
  teamId: string;
  teamName: string;
  logoUrl?: string;
  matchesPlayed: number;
  placementPoints: number;
  totalPoints: number;
}

export interface FilterState {
  tournamentId: string;
  roundId: string;
  group: GroupFilter;
  view: StandingsView;
}

export interface LeaderboardResponse {
  filters: FilterState;
  rows: LeaderboardRow[];
  generatedAt: string;
}

/**
 * Aggregates match stats for a team into a single Leaderboard row.
 * Formula:
 *  - Total Points = Placement Points + Kills
 *  - Total Damage = CQB Damage + LRB Damage
 *  - Total Kills = CQB Kills + LRB Kills
 */
export function aggregateTeamStats(stats: TeamStats[]): Omit<LeaderboardRow, 'rank' | 'teamName' | 'logoUrl'> {
  const initial: Omit<LeaderboardRow, 'rank' | 'teamName' | 'logoUrl'> = {
    teamId: stats[0]?.teamId ?? '',
    matchesPlayed: stats.length,
    placementPoints: 0,
    totalPoints: 0,
    kills: 0,
    assists: 0,
    cqbKills: 0,
    lrbKills: 0,
    cqbDamage: 0,
    lrbDamage: 0,
    totalDamage: 0,
  };

  return stats.reduce((acc, curr) => {
    const cqbKills = curr.cqbKills ?? 0;
    const lrbKills = curr.lrbKills ?? 0;
    const totalKills = curr.kills || (cqbKills + lrbKills);
    const cqbDmg = curr.cqbDamage ?? 0;
    const lrbDmg = curr.lrbDamage ?? 0;
    const totalDmg = curr.totalDamage || (cqbDmg + lrbDmg);

    return {
      teamId: acc.teamId || curr.teamId,
      matchesPlayed: acc.matchesPlayed,
      placementPoints: acc.placementPoints + curr.placementPoints,
      totalPoints: acc.totalPoints + (curr.placementPoints + totalKills),
      kills: acc.kills + totalKills,
      assists: acc.assists + (curr.assists ?? 0),
      cqbKills: acc.cqbKills + cqbKills,
      lrbKills: acc.lrbKills + lrbKills,
      cqbDamage: acc.cqbDamage + cqbDmg,
      lrbDamage: acc.lrbDamage + lrbDmg,
      totalDamage: acc.totalDamage + totalDmg,
    };
  }, initial);
}

/**
 * Ranks leaderboard rows based on:
 *  1. Total Points (DESC)
 *  2. Total Kills (DESC)
 *  3. Total Damage (DESC)
 *  4. Team Name (ASC)
 */
export function rankLeaderboard(rows: Omit<LeaderboardRow, 'rank'>[]): LeaderboardRow[] {
  return [...rows]
    .sort((a, b) => 
      b.totalPoints - a.totalPoints || 
      b.kills - a.kills || 
      b.totalDamage - a.totalDamage || 
      a.teamName.localeCompare(b.teamName)
    )
    .map((row, index) => ({
      ...row,
      rank: index + 1,
    }));
}
