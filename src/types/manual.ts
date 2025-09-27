import { type Node } from "@xyflow/react";
import type {
  LeagueCategory,
  LeagueCategoryRound,
  RoundTypeEnum,
} from "./leagueCategoryTypes";
import type { LeagueMatch } from "./leagueMatch";

export interface IGroup {
  group_id: string;
  display_name: string;
  league_category_id?: string;
  round_id?: string;
  round_name?: string;
}

export type LeagueCategoryNodeData = {
  type: "league_category";
  league_category: LeagueCategory;
};
export type LeagueCategoryRoundNodeData = {
  type: "league_category_round";
  league_category_round: RoundTypeEnum;
  round: Partial<LeagueCategoryRound>;
};
export type LeagueMatchNodeData = {
  type: "league_match";
  league_match: Partial<LeagueMatch>;
};
export type GroupNodeData = { type: "group"; group: Partial<IGroup> };

export type FlowNodeData =
  | LeagueCategoryNodeData
  | LeagueCategoryRoundNodeData
  | LeagueMatchNodeData
  | GroupNodeData;

export type FlowNode = Node<FlowNodeData>;
