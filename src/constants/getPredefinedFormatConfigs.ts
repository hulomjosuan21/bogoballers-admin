import { RoundFormatTypesEnum } from "@/types/leagueCategoryTypes";
import type {
  BestOfConfig,
  DoubleEliminationConfig,
  KnockoutConfig,
  RoundRobinConfig,
  TwiceToBeatConfig,
} from "@/types/formatConfig";

export const getPredefinedFormatConfigs = (
  nTeam: number,
  group: number
): Array<{
  label: string;
  format_type: RoundFormatTypesEnum;
  variant: string;
  format_config:
    | RoundRobinConfig
    | KnockoutConfig
    | DoubleEliminationConfig
    | BestOfConfig
    | TwiceToBeatConfig;
}> => {
  return [
    {
      label: "• 1 Group, All Play All",
      format_type: RoundFormatTypesEnum.RoundRobin,
      variant: "roundrobin_1group",
      format_config: {
        group_count: group,
        team_count: nTeam,
        advances_per_group: 2,
        regeneration_count: 1,
      } as RoundRobinConfig,
    },
    {
      label: "• Single Elim, Random Seeding",
      format_type: RoundFormatTypesEnum.Knockout,
      variant: "knockout_singleelim",
      format_config: {
        group_count: 1,
        team_count: nTeam,
        single_elim: true,
        seeding: "random",
        regeneration_count: 0,
      } as KnockoutConfig,
    },
    {
      label: "• Standard",
      format_type: RoundFormatTypesEnum.DoubleElimination,
      variant: "doubleelim_standard",
      format_config: {
        group_count: 1,
        team_count: nTeam,
        max_loss: 2,
        brackets: ["winners", "losers"],
        regeneration_count: 0,
      } as DoubleEliminationConfig,
    },
    {
      label: "• Best of 3",
      format_type: RoundFormatTypesEnum.BestOf,
      variant: "bestof_3",
      format_config: {
        group_count: 1,
        team_count: nTeam,
        games: 3,
        regeneration_count: 0,
      } as BestOfConfig,
    },
    {
      label: "• Finals Format",
      format_type: RoundFormatTypesEnum.TwiceToBeat,
      variant: "twicetobeat_final",
      format_config: {
        advantaged_team: "",
        challenger_team: "",
        max_games: 2,
      } as TwiceToBeatConfig,
    },
  ];
};
