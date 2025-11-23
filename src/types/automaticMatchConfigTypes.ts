import { type Node } from "@xyflow/react";
import type {
  LeagueCategory,
  LeagueCategoryRound,
  RoundFormat,
  RoundFormatTypesEnum,
  RoundTypeEnum,
} from "./leagueCategoryTypes";

export type AutomaticMatchConfigLeagueCategoryNodeData = {
  type: "league_category";
  league_category: LeagueCategory;
};
export type AutomaticMatchConfigLeagueCategoryRoundNodeData = {
  type: "league_category_round";
  league_category_round: RoundTypeEnum;
  round: Partial<LeagueCategoryRound>;
};
export type AutomaticMatchConfigRoundFormatData = {
  type: "league_category_round_format";
  format_name: string;
  league_category_id: string;
  format_type: RoundFormatTypesEnum;
  format_obj: Partial<RoundFormat>;
};

export type AutomaticMatchConfigFlowNodeData =
  | AutomaticMatchConfigLeagueCategoryNodeData
  | AutomaticMatchConfigLeagueCategoryRoundNodeData
  | AutomaticMatchConfigRoundFormatData;

export type AutomaticMatchConfigFlowNode =
  Node<AutomaticMatchConfigFlowNodeData>;
