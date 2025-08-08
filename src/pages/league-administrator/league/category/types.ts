import type { RoundStateEnum, RoundTypeEnum } from "@/enums/enums";

export type StatusMap = Record<RoundTypeEnum, RoundStateEnum>;

export interface CategoryNodeData {
  categoryId: string;
  categoryName: string;
  [key: string]: unknown;
}

export interface RoundNodeData {
  label: RoundTypeEnum;
  status: RoundStateEnum;
  onOpen: () => void;
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
