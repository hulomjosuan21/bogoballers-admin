import { useFormatConfigStore } from "@/stores/formatConfigStore";
import type {
  BestOfConfig,
  DoubleEliminationConfig,
  KnockoutConfig,
  RoundRobinConfig,
  TwiceToBeatConfig,
} from "@/types/formatConfig";

export const buildFormatConfig = (
  variant?: string,
  store = useFormatConfigStore.getState()
):
  | (RoundRobinConfig & { label: string })
  | (KnockoutConfig & { label: string })
  | (DoubleEliminationConfig & { label: string })
  | (BestOfConfig & { label: string })
  | (TwiceToBeatConfig & { label: string }) => {
  const { rrConfig, koConfig, deConfig, boConfig, ttbConfig } = store;

  switch (variant) {
    case "roundrobin_1group":
      return {
        group_count: parseInt(rrConfig.group_count) || 1,
        advances_per_group: parseInt(rrConfig.advances_per_group) || 2,
        label: rrConfig.label || "• 1 Group, All Play All",
        use_point_system: rrConfig.use_point_system || false,
      };
    case "knockout_singleelim":
      return {
        group_count: parseInt(koConfig.group_count) || 1,
        single_elim: koConfig.single_elim,
        seeding: koConfig.seeding,
        label: koConfig.label || "• Single Elim, Random Seeding",
      };
    case "doubleelim_standard":
      return {
        group_count: parseInt(deConfig.group_count) || 1,
        max_loss: parseInt(deConfig.max_loss) || 2,
        progress_group: parseInt(deConfig.progress_group) || 1,
        max_progress_group: parseInt(deConfig.max_progress_group) || 6,
        brackets: ["winners", "losers"],
        label: deConfig.label || "• Standard",
      };

    case "bestof_3":
      return {
        group_count: parseInt(boConfig.group_count) || 1,
        games: parseInt(boConfig.games) || 3,
        label: boConfig.label || "• Best of 3",
        advances_per_group: parseInt(boConfig.advances_per_group) || 1,
      };
    case "twicetobeat_final":
      return {
        advantaged_team: ttbConfig.advantaged_team || "",
        challenger_team: ttbConfig.challenger_team || "",
        max_games: parseInt(ttbConfig.max_games) || 2,
        label: ttbConfig.label || "• Finals Format",
      };
    default:
      return {} as any;
  }
};
