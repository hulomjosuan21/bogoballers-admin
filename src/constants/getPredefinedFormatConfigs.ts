import { RoundFormatTypesEnum } from "@/types/leagueCategoryTypes";

export const getPredefinedFormatConfigs = (
  nTeam: number
): Array<{
  label: string;
  format_type: RoundFormatTypesEnum;
  variant: string;
  format_config: Record<string, any>;
}> => {
  return [
    {
      label: "• 1 Group, All Play All",
      format_type: RoundFormatTypesEnum.RoundRobin,
      variant: "roundrobin_1group",
      format_config: {
        groups: 1,
        games_per_team: Math.max(nTeam - 1, 0),
        advances_per_group: 2,
      },
    },
    {
      label: "• 2 Groups, Top 2 Advance",
      format_type: RoundFormatTypesEnum.RoundRobin,
      variant: "roundrobin_2groups",
      format_config: {
        groups: 2,
        games_per_team: Math.max(Math.ceil(nTeam / 2) - 1, 0),
        advances_per_group: 2,
      },
    },
    {
      label: "• Single Elim, Random Seeding",
      format_type: RoundFormatTypesEnum.Knockout,
      variant: "knockout_singleelim",
      format_config: {
        single_elim: true,
        seeding: "random",
        advances: 1,
        total_matches: Math.max(nTeam - 1, 0),
      },
    },
    {
      label: "• Standard",
      format_type: RoundFormatTypesEnum.DoubleElimination,
      variant: "doubleelim_standard",
      format_config: {
        max_loss: 2,
        brackets: ["winners", "losers"],
        advances: 1,
        total_matches: Math.max(nTeam * 2 - 2, 0),
      },
    },
    {
      label: "• Best of 3",
      format_type: RoundFormatTypesEnum.BestOf,
      variant: "bestof_3",
      format_config: {
        games: 3,
        advances: 1,
        total_games: 3,
      },
    },
    {
      label: "• Finals Format",
      format_type: RoundFormatTypesEnum.TwiceToBeat,
      variant: "twicetobeat_final",
      format_config: {
        advantaged_team: "TBD",
        challenger_team: "TBD",
        max_games: 2,
      },
    },
  ];
};
