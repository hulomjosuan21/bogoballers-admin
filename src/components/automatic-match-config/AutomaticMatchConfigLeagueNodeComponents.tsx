import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axiosClient";
type ManualTeamOption = {
  league_team_id: string;
  team_name: string;
  group_label: string;
};
interface Props {
  leagueCategoryId: string;
  advantagedTeamId?: string;
  challengerTeamId?: string;
  onChange: (data: {
    advantaged_team?: string;
    challenger_team?: string;
  }) => void;
}

export default function SeriesTeamSelector({
  leagueCategoryId,
  advantagedTeamId,
  challengerTeamId,
  onChange,
}: Props) {
  const queryKey = ["league-teams-grouped-automatic", leagueCategoryId];

  const { data: teams, isLoading } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      if (!leagueCategoryId) return [];

      const { data } = await axiosClient.get<ManualTeamOption[]>(
        `/league-team/grouped/${leagueCategoryId}`
      );
      return data;
    },
  });

  if (isLoading) return <p>Loading teams...</p>;
  if (!teams || teams.length === 0) return <p>No teams available</p>;

  const isTwoTeams = teams.length === 2;

  const advantagedOptions = isTwoTeams
    ? teams
    : teams.filter((team) => team.league_team_id !== challengerTeamId);

  const challengerOptions = isTwoTeams
    ? teams
    : teams.filter((team) => team.league_team_id !== advantagedTeamId);

  return (
    <div className="space-y-2 mt-2">
      <Label>Advantaged Team</Label>
      <Select
        value={advantagedTeamId ?? ""}
        onValueChange={(value) => onChange({ advantaged_team: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select advantaged team" />
        </SelectTrigger>
        <SelectContent>
          {advantagedOptions.map((team) => (
            <SelectItem key={team.league_team_id} value={team.league_team_id}>
              {team.team_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Label>Challenger Team</Label>
      <Select
        value={challengerTeamId ?? ""}
        onValueChange={(value) => onChange({ challenger_team: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select challenger team" />
        </SelectTrigger>
        <SelectContent>
          {challengerOptions.map((team) => (
            <SelectItem key={team.league_team_id} value={team.league_team_id}>
              {team.team_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
