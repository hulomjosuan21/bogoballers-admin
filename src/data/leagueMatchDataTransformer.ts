import type { GameStateWithHistory } from "@/context/GameContext";
import type { LeagueMatch } from "@/types/leagueMatch";
import type { LeaguePlayer } from "@/types/player";
import type { MatchBook, PlayerBook } from "@/types/scorebook";

export const transformApiDataToScorebookState = (
  apiMatch: LeagueMatch
): GameStateWithHistory => {
  const transformPlayer = (
    apiPlayer: LeaguePlayer,
    teamId: string
  ): PlayerBook => ({
    player_id: apiPlayer.player_id,
    player_team_id: teamId,
    full_name: apiPlayer.full_name,
    jersey_name: apiPlayer.jersey_name,
    jersey_number: apiPlayer.jersey_number,

    total_score: 0,
    score_per_qtr: [],
    P: 0,
    T: 0,
    summary: {
      fg2m: 0,
      fg2a: 0,
      fg3m: 0,
      fg3a: 0,
      ftm: 0,
      fta: 0,
      reb: 0,
      ast: 0,
      stl: 0,
      blk: 0,
      tov: 0,
    },
    onBench: false,
  });

  const present: MatchBook = {
    match_id: apiMatch.league_match_id,
    quarters: apiMatch.quarters,
    minutes_per_quarter: apiMatch.minutes_per_quarter,
    minutes_per_overtime: apiMatch.minutes_per_overtime,

    home_total_score: 0,
    away_total_score: 0,
    is_overtime: false,
    time_seconds: apiMatch.minutes_per_quarter * 60,
    timer_running: false,
    current_quarter: 1,

    home_team: {
      side: "home",
      team_id: apiMatch.home_team.team_id,
      team_name: apiMatch.home_team.team_name,
      coach: apiMatch.home_team.coach_name,
      capT_ball: null,
      coachT: 0,
      none_memberT: 0,
      score_per_qtr: [{ qtr: 1, score: 0 }],
      teamF_per_qtr: [{ qtr: 1, foul: 0 }],
      timeouts: [],
      players: apiMatch.home_team.league_players.map((p) =>
        transformPlayer(p, apiMatch.home_team.team_id)
      ),
    },
    away_team: {
      side: "away",
      team_id: apiMatch.away_team.team_id,
      team_name: apiMatch.away_team.team_name,
      coach: apiMatch.away_team.coach_name,
      coachT: 0,
      capT_ball: null,
      none_memberT: 0,
      score_per_qtr: [{ qtr: 1, score: 0 }],
      teamF_per_qtr: [{ qtr: 1, foul: 0 }],
      timeouts: [],
      players: apiMatch.away_team.league_players.map((p) =>
        transformPlayer(p, apiMatch.away_team.team_id)
      ),
    },
  };

  present.home_team.players.forEach((p, i) => {
    p.onBench = i >= 5;
  });
  present.away_team.players.forEach((p, i) => {
    p.onBench = i >= 5;
  });

  return { past: [], present, future: [] };
};
