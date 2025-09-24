import type { XYPosition } from "@xyflow/react";
import type {
  LeagueCategory,
  LeagueCategoryRound,
} from "./leagueCategoryTypes";
import type { LeagueMatch } from "./leagueMatch";
import { type Node } from "@xyflow/react";

export interface ILeagueCategory extends LeagueCategory {
  position: XYPosition;
}

export interface ILeagueMatch extends LeagueMatch {
  position: XYPosition;
}

export interface ILeagueCategoryRound extends LeagueCategoryRound {
  position_two: XYPosition;
}

export type LeagueCategoryNodeData = { category: ILeagueCategory };

export type LeagueCategoryRoundNodeData = { round: ILeagueCategoryRound };
export type LeagueMatchNodeData = { match: ILeagueMatch };

export type NodeData =
  | LeagueCategoryNodeData
  | LeagueCategoryRoundNodeData
  | LeagueMatchNodeData;

export type LeagueCategoryNode = Node<LeagueCategoryNodeData>;
export type LeagueCategoryRoundNode = Node<LeagueCategoryRoundNodeData>;
export type LeagueMatchNode = Node<LeagueMatchNodeData>;
