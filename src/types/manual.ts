import { type Node } from "@xyflow/react";
import type {
  LeagueCategory,
  LeagueCategoryRound,
  RoundTypeEnum,
} from "./leagueCategoryTypes";
import type { LeagueMatch } from "./leagueMatch";

export interface IManualMatchConfigGroup {
  group_id: string;
  display_name: string;
  league_category_id?: string;
  round_id?: string;
  round_name?: string;
}

export type ManualMatchConfigLeagueCategoryNodeData = {
  type: "league_category";
  league_category: LeagueCategory;
};
export type ManualMatchConfigLeagueCategoryRoundNodeData = {
  type: "league_category_round";
  league_category_round: RoundTypeEnum;
  round: Partial<LeagueCategoryRound>;
};
export type ManualMatchConfigLeagueMatchNodeData = {
  type: "league_match";
  league_match: Partial<LeagueMatch>;
};
export type ManualMatchConfigGroupNodeData = {
  type: "group";
  group: Partial<IManualMatchConfigGroup>;
};

export type ManualMatchConfigFlowNodeData =
  | ManualMatchConfigLeagueCategoryNodeData
  | ManualMatchConfigLeagueCategoryRoundNodeData
  | ManualMatchConfigLeagueMatchNodeData
  | ManualMatchConfigGroupNodeData;

export type ManualMatchConfigFlowNode = Node<ManualMatchConfigFlowNodeData>;
