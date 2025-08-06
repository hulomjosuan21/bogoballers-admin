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

export interface RoundNodeData extends Record<string, unknown> {
  label: RoundTypeEnum;
  status: string;
  onOpen: () => void;
}

export interface CategoryNodeData {
  categoryId: string;
  categoryName: string;
}

export type RoundDetails = {
  label: RoundTypeEnum;
};

export type RoundMenuItem = {
  label: RoundTypeEnum;
};
