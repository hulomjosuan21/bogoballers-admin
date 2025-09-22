import {
  BracketFlow,
  type MatchNodeData,
} from "@/components/bracket/Bracketflow";
import { useLeagueMatch } from "@/hooks/leagueMatch";

type Props = {
  leagueCategoryId?: string;
  roundId?: string;
};

export default function BracketWrapper({ leagueCategoryId, roundId }: Props) {
  const { leagueMatchData } = useLeagueMatch(leagueCategoryId, roundId);

  const transformedMatches = (leagueMatchData ?? []).map(
    (match): MatchNodeData => ({
      league_match_id: match.league_match_id,
      home_team_name: match.home_team?.team_name ?? null,
      away_team_name: match.away_team?.team_name ?? null,
      home_score: match.home_team_score,
      away_score: match.away_team_score,
      depends_on_match_ids: match.depends_on_match_ids ?? [],
      round_number: match.round_number,
      bracket_side: match.bracket_side,
    })
  );

  return <BracketFlow matches={transformedMatches} />;
}
