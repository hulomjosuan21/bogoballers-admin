import type { RoundStateEnum, RoundTypeEnum } from "@/enums/enums";
import type { LeagueCategory, LeagueCategoryRound } from "@/types/league";

export type StatusMap = Record<RoundTypeEnum, RoundStateEnum>;

export interface CategoryNodeData {
  category: LeagueCategory;
  [key: string]: unknown;
}

export interface RoundNodeData {
  round: LeagueCategoryRound;
  [key: string]: unknown;
}
export interface FormatNodeData {
  label: string;
  [key: string]: unknown;
}

export type NodeData = CategoryNodeData | RoundNodeData | FormatNodeData;

export type RoundDetails = {
  label: RoundTypeEnum;
};

export type RoundMenuItem = {
  label: RoundTypeEnum;
};
