export type StatusMap = Record<RoundTypeEnum, RoundStateEnum>;

export enum RoundTypeEnum {
  Elimination = "Elimination",
  QuarterFinal = "Quarter Final",
  SemiFinal = "Semi Final",
  Final = "Final",
}

export enum RoundFormatEnum {
  RoundRobin = "Round Robin",
  Knockout = "Knockout",
}

export enum RoundStateEnum {
  Upcoming = "Upcoming",
  Ongoing = "Ongoing",
  Finished = "Finished",
}

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
