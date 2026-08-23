from dataclasses import dataclass, field
from decimal import Decimal
from enum import StrEnum
from typing import Optional


class RoundKind(StrEnum):
    QUALIFIERS = "QUALIFIERS"
    FINALS = "FINALS"
    GRAND_FINALS = "GRAND_FINALS"


class GroupFilter(StrEnum):
    OVERALL = "OVERALL"
    A_VS_B = "A_VS_B"
    C_VS_D = "C_VS_D"
    A_VS_C = "A_VS_C"
    B_VS_D = "B_VS_D"
    A_VS_D = "A_VS_D"
    B_VS_C = "B_VS_C"


class StandingsView(StrEnum):
    TOTAL = "TOTAL"
    MATCH_1 = "MATCH_1"
    MATCH_2 = "MATCH_2"
    MATCH_3 = "MATCH_3"
    MATCH_4 = "MATCH_4"
    MATCH_5 = "MATCH_5"
    MATCH_6 = "MATCH_6"


@dataclass
class PlayerMatchStats:
    player_id: str
    match_id: str
    kills: int = 0
    assists: int = 0
    cqb_kills: int = 0
    lrb_kills: int = 0
    cqb_damage: Decimal = Decimal("0")
    lrb_damage: Decimal = Decimal("0")

    @property
    def total_kills(self) -> int:
        return self.cqb_kills + self.lrb_kills

    @property
    def total_damage(self) -> Decimal:
        return self.cqb_damage + self.lrb_damage


@dataclass
class TeamMatchStats:
    team_id: str
    match_id: str
    placement: Optional[int] = None
    placement_points: int = 0
    kills: int = 0
    assists: int = 0
    cqb_kills: int = 0
    lrb_kills: int = 0
    cqb_damage: Decimal = Decimal("0")
    lrb_damage: Decimal = Decimal("0")

    @property
    def total_points(self) -> int:
        return self.placement_points + self.kills

    @property
    def total_damage(self) -> Decimal:
        return self.cqb_damage + self.lrb_damage


@dataclass
class Player:
    id: str
    team_id: str
    display_name: str
    jersey_number: Optional[int] = None
    active: bool = True
    match_stats: list[PlayerMatchStats] = field(default_factory=list)


@dataclass
class Team:
    id: str
    tournament_id: str
    name: str
    logo_url: Optional[str] = None
    players: list[Player] = field(default_factory=list)
    match_stats: list[TeamMatchStats] = field(default_factory=list)


@dataclass
class LeaderboardRow:
    rank: int
    team_id: str
    team_name: str
    total_points: int
    placement_points: int
    kills: int
    assists: int
    cqb_kills: int
    lrb_kills: int
    cqb_damage: Decimal
    lrb_damage: Decimal
    total_damage: Decimal
    matches_played: int
    logo_url: Optional[str] = None


def build_leaderboard(teams: list[Team]) -> list[LeaderboardRow]:
    """
    Computes accumulated team totals:
      - Total Points = Placement Points + Total Kills
      - Total Damage = CQB Damage + LRB Damage
      - Rank (#) ordered by Total Points (DESC), Kills (DESC), Total Damage (DESC), Team Name (ASC).
    """
    rows = []
    for team in teams:
        stats = team.match_stats
        placement_pts = sum(s.placement_points for s in stats)
        kills_sum = sum(s.kills for s in stats)
        cqb_dmg = sum((s.cqb_damage for s in stats), Decimal("0"))
        lrb_dmg = sum((s.lrb_damage for s in stats), Decimal("0"))

        rows.append(LeaderboardRow(
            rank=0,
            team_id=team.id,
            team_name=team.name,
            total_points=placement_pts + kills_sum,
            placement_points=placement_pts,
            kills=kills_sum,
            assists=sum(s.assists for s in stats),
            cqb_kills=sum(s.cqb_kills for s in stats),
            lrb_kills=sum(s.lrb_kills for s in stats),
            cqb_damage=cqb_dmg,
            lrb_damage=lrb_dmg,
            total_damage=cqb_dmg + lrb_dmg,
            matches_played=len(stats),
            logo_url=team.logo_url,
        ))
    rows.sort(key=lambda row: (-row.total_points, -row.kills, -row.total_damage, row.team_name.casefold()))
    for rank, row in enumerate(rows, start=1):
        row.rank = rank
    return rows
