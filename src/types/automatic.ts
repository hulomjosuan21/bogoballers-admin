import { type Node } from "@xyflow/react";
import type {
  LeagueCategory,
  LeagueCategoryRound,
  RoundTypeEnum,
} from "./leagueCategoryTypes";
export interface IAutomaticMatchConfigGroup {
  group_id: string;
  display_name: string;
  league_category_id?: string;
  round_id?: string;
  round_name?: string;
}
export type AutomaticMatchConfigLeagueCategoryNodeData = {
  type: "league_category";
  league_category: LeagueCategory;
};
export type AutomaticMatchConfigLeagueCategoryRoundNodeData = {
  type: "league_category_round";
  league_category_round: RoundTypeEnum;
  round: Partial<LeagueCategoryRound>;
};
export type AutomaticMatchConfigGroupNodeData = {
  type: "group";
  group: Partial<IAutomaticMatchConfigGroup>;
};
export type AutomaticMatchConfigFlowNodeData =
  | AutomaticMatchConfigLeagueCategoryNodeData
  | AutomaticMatchConfigLeagueCategoryRoundNodeData
  | AutomaticMatchConfigGroupNodeData;

export type AutomaticMatchConfigFlowNode =
  Node<AutomaticMatchConfigFlowNodeData>;
