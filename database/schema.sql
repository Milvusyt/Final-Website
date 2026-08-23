-- ============================================================================
-- SQUAD ONE ESPORTS TOURNAMENT LEADERBOARD SCHEMA (PostgreSQL)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enumerations for tournament structure & group matchups
CREATE TYPE round_kind AS ENUM ('QUALIFIERS', 'FINALS', 'GRAND_FINALS');
CREATE TYPE group_filter AS ENUM ('OVERALL', 'A_VS_B', 'C_VS_D', 'A_VS_C', 'B_VS_D', 'A_VS_D', 'B_VS_C');
CREATE TYPE tournament_status AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED');

-- 1. Tournaments Table
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  season_number INTEGER NOT NULL CHECK (season_number > 0),
  status tournament_status NOT NULL DEFAULT 'UPCOMING',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, season_number)
);

-- 2. Rounds Table (Qualifiers, Finals, with specific Group Filters)
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kind round_kind NOT NULL,
  round_number INTEGER NOT NULL CHECK (round_number > 0),
  group_filter group_filter NOT NULL DEFAULT 'OVERALL',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  UNIQUE (tournament_id, round_number, group_filter)
);

-- 3. Matches Table (Match 1 through Match 6 per Round)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  match_number INTEGER NOT NULL CHECK (match_number BETWEEN 1 AND 6),
  name TEXT NOT NULL,
  map_name TEXT NOT NULL DEFAULT 'Erangel',
  played_at TIMESTAMPTZ,
  UNIQUE (round_id, match_number)
);

-- 4. Teams Table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, normalized_name)
);

-- 5. Players Table (Squad members per Team)
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  jersey_number INTEGER,
  active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (team_id, display_name)
);

-- 6. Team Match Stats Table (Aggregated match-level team metrics)
CREATE TABLE team_match_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  placement INTEGER CHECK (placement > 0),
  placement_points INTEGER NOT NULL DEFAULT 0 CHECK (placement_points >= 0),
  kills INTEGER NOT NULL DEFAULT 0 CHECK (kills >= 0),
  assists INTEGER NOT NULL DEFAULT 0 CHECK (assists >= 0),
  cqb_kills INTEGER NOT NULL DEFAULT 0 CHECK (cqb_kills >= 0),
  lrb_kills INTEGER NOT NULL DEFAULT 0 CHECK (lrb_kills >= 0),
  cqb_damage NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (cqb_damage >= 0),
  lrb_damage NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (lrb_damage >= 0),
  UNIQUE (team_id, match_id),
  CHECK (kills = cqb_kills + lrb_kills)
);

-- 7. Player Match Stats Table (Individual player combat telemetry)
CREATE TABLE player_match_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  kills INTEGER NOT NULL DEFAULT 0 CHECK (kills >= 0),
  assists INTEGER NOT NULL DEFAULT 0 CHECK (assists >= 0),
  cqb_kills INTEGER NOT NULL DEFAULT 0 CHECK (cqb_kills >= 0),
  lrb_kills INTEGER NOT NULL DEFAULT 0 CHECK (lrb_kills >= 0),
  cqb_damage NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (cqb_damage >= 0),
  lrb_damage NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (lrb_damage >= 0),
  UNIQUE (player_id, match_id),
  CHECK (kills = cqb_kills + lrb_kills)
);

-- Indices for rapid filtering and leaderboard aggregation queries
CREATE INDEX idx_rounds_tournament ON rounds(tournament_id, round_number);
CREATE INDEX idx_matches_round ON matches(round_id, match_number);
CREATE INDEX idx_teams_tournament ON teams(tournament_id, normalized_name);
CREATE INDEX idx_team_stats_match ON team_match_stats(match_id, team_id);
CREATE INDEX idx_player_stats_match ON player_match_stats(match_id, player_id);

-- ============================================================================
-- DYNAMIC LEADERBOARD QUERY
-- Supports filtering by round_id, group_filter, and optional match_number (or NULL for Total).
-- Total Points = Placement Points + Total Kills
-- Total Damage = CQB Damage + LRB Damage
-- Total Kills = CQB Kills + LRB Kills
-- ============================================================================

CREATE OR REPLACE VIEW v_team_leaderboard AS
WITH totals AS (
  SELECT
    t.id AS team_id,
    t.tournament_id,
    t.name AS team_name,
    t.logo_url,
    r.id AS round_id,
    r.group_filter,
    m.match_number,
    COUNT(DISTINCT m.id)::INTEGER AS matches_played,
    COALESCE(SUM(s.placement_points), 0)::INTEGER AS placement_points,
    COALESCE(SUM(s.kills), 0)::INTEGER AS kills,
    COALESCE(SUM(s.assists), 0)::INTEGER AS assists,
    COALESCE(SUM(s.cqb_kills), 0)::INTEGER AS cqb_kills,
    COALESCE(SUM(s.lrb_kills), 0)::INTEGER AS lrb_kills,
    COALESCE(SUM(s.cqb_damage), 0)::NUMERIC(10,2) AS cqb_damage,
    COALESCE(SUM(s.lrb_damage), 0)::NUMERIC(10,2) AS lrb_damage
  FROM teams t
  JOIN team_match_stats s ON s.team_id = t.id
  JOIN matches m ON m.id = s.match_id
  JOIN rounds r ON r.id = m.round_id
  GROUP BY t.id, t.tournament_id, t.name, t.logo_url, r.id, r.group_filter, m.match_number
)
SELECT
  ROW_NUMBER() OVER (
    PARTITION BY round_id, group_filter, match_number 
    ORDER BY (placement_points + kills) DESC, kills DESC, (cqb_damage + lrb_damage) DESC, team_name
  ) AS rank,
  team_id,
  tournament_id,
  round_id,
  group_filter,
  match_number,
  team_name,
  logo_url,
  matches_played,
  (placement_points + kills) AS total_points,
  placement_points,
  kills,
  assists,
  cqb_kills,
  lrb_kills,
  cqb_damage,
  lrb_damage,
  (cqb_damage + lrb_damage) AS total_damage
FROM totals;
