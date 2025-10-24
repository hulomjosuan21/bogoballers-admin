import type { GameStateWithHistory } from "@/context/GameContext";
import type { LeagueMatch } from "@/types/leagueMatch";
import type { LeaguePlayer } from "@/types/player";
import type { MatchBook, PlayerBook } from "@/types/scorebook";
function markIncludeFirst5(players: LeaguePlayer[]): LeaguePlayer[] {
  // Get all players already marked true
  let starters = players.filter((p) => p.include_first5);

  if (starters.length === 0) {
    // Rule 3: none marked -> take first 5
    players.forEach((p, i) => {
      p.include_first5 = i < 5;
    });
    return players;
  }

  if (starters.length < 5) {
    // Rule 2: fill until 5
    for (const p of players) {
      if (!p.include_first5) {
        p.include_first5 = true;
        starters.push(p);
        if (starters.length === 5) break;
      }
    }
  }

  if (starters.length > 5) {
    // Optional safeguard: keep only first 5 as true
    let count = 0;
    players.forEach((p) => {
      if (p.include_first5) {
        if (count < 5) {
          count++;
        } else {
          p.include_first5 = false; // reset extras
        }
      }
    });
  }

  return players;
}

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
    profile_image_url: apiPlayer.profile_image_url,

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
    default_quarters: apiMatch.quarters,
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
      team_id: apiMatch.home_team!.team_id,
      team_name: apiMatch.home_team!.team_name,
      coach: apiMatch.home_team!.coach_name,
      team_logo_url: apiMatch!.home_team?.team_logo_url ?? null,
      capT_ball: null,
      coachT: 0,
      none_memberT: 0,
      score_per_qtr: [{ qtr: 1, score: 0 }],
      teamF_per_qtr: [{ qtr: 1, foul: 0 }],
      timeouts: [],
      players: apiMatch.home_team!.league_players.map((p) =>
        transformPlayer(p, apiMatch.home_team!.team_id)
      ),
    },
    away_team: {
      side: "away",
      team_id: apiMatch.away_team!.team_id,
      team_name: apiMatch.away_team!.team_name,
      coach: apiMatch.away_team!.coach_name,
      team_logo_url: apiMatch!.away_team?.team_logo_url ?? null,
      coachT: 0,
      capT_ball: null,
      none_memberT: 0,
      score_per_qtr: [{ qtr: 1, score: 0 }],
      teamF_per_qtr: [{ qtr: 1, foul: 0 }],
      timeouts: [],
      players: apiMatch.away_team!.league_players.map((p) =>
        transformPlayer(p, apiMatch.away_team!.team_id)
      ),
    },
  };

  const homeStarters = markIncludeFirst5(apiMatch.home_team!.league_players);
  const awayStarters = markIncludeFirst5(apiMatch.away_team!.league_players);

  present.home_team.players.forEach((p) => {
    const found = homeStarters.find((s) => s.player_id === p.player_id);
    p.onBench = !found?.include_first5;
  });

  present.away_team.players.forEach((p) => {
    const found = awayStarters.find((s) => s.player_id === p.player_id);
    p.onBench = !found?.include_first5;
  });

  return { past: [], present, future: [] };
};
