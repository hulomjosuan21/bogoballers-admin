import { type Node } from "@xyflow/react";
import type {
  LeagueCategory,
  LeagueCategoryRound,
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

export type AutomaticMatchConfigFlowNodeData =
  | AutomaticMatchConfigLeagueCategoryNodeData
  | AutomaticMatchConfigLeagueCategoryRoundNodeData;

export type AutomaticMatchConfigFlowNode =
  Node<AutomaticMatchConfigFlowNodeData>;
