export interface LeagueCategory {
  category_id: string;
  league_id: string;
  category_name: string;
  max_team: number;
  accept_teams: boolean;
  team_entrance_fee_amount: number;
  individual_player_entrance_fee_amount: number;
  created_at: string;
  updated_at: string;
  rounds: LeagueCategoryRound[];
}

export interface LeagueCategoryRound {
  round_id: string;
  category_id: string;
  round_name: string;
  round_order: number;
  round_status: string;
  round_format?: LeagueRoundFormat | null;
  position: {
    x: number;
    y: number;
  };
  next_round_id?: string | null;
}

export type CategoryOperation =
  | CreateRoundOperation
  | UpdatePositionOperation
  | UpdateFormatOperation
  | UpdateNextRoundOperation
  | DeleteRoundOperation;

interface UpdateNextRoundOperation {
  type: "update_next_round";
  data: {
    round_id: string;
    next_round_id: string | null;
  };
}

interface CreateRoundOperation {
  type: "create_round";
  data: {
    round_id: string;
    round_name: string;
    round_status: RoundStateEnum;
    round_order: number;
    position: { x: number; y: number };
    next_round_id?: string | null;
  };
}

interface UpdatePositionOperation {
  type: "update_position";
  data: {
    round_id: string;
    position: { x: number; y: number };
  };
}

interface UpdateFormatOperation {
  type: "update_format";
  data: {
    round_id: string;
    round_format: LeagueRoundFormat | null;
  };
}

interface DeleteRoundOperation {
  type: "delete_round";
  data: {
    round_id: string;
  };
}

interface UpdateNextRoundOperation {
  type: "update_next_round";
  data: {
    round_id: string;
    next_round_id: string | null;
  };
}

export interface SaveChangesPayload {
  categoryId: string;
  operations: CategoryOperation[];
}

export interface LeagueRoundFormat {
  format_type: RoundFormatTypesEnum;
  pairing_method: string;
  round_id: string;
  position: {
    x: number;
    y: number;
  };
}

export interface RoundNodeData {
  round: LeagueCategoryRound;
  _isNew?: boolean;
  viewOnly: boolean;
  [key: string]: unknown;
}

export enum RoundTypeEnum {
  Elimination = "Elimination",
  QuarterFinal = "Quarterfinal",
  SemiFinal = "Semifinal",
  Final = "Final",
}

export enum RoundStateEnum {
  Upcoming = "Upcoming",
  Ongoing = "Ongoing",
  Finished = "Finished",
}

const roundOrderMap: Record<RoundTypeEnum, number> = {
  [RoundTypeEnum.Elimination]: 0,
  [RoundTypeEnum.QuarterFinal]: 1,
  [RoundTypeEnum.SemiFinal]: 2,
  [RoundTypeEnum.Final]: 3,
};

export enum RoundFormatTypesEnum {
  RoundRobin = "Round Robin",
  Knockout = "Knockout",
  DoubleElimination = "Double Elimination",
  TwiceToBeat = "Twice to Beat",
  BestOfThree = "Best of Three",
  BestOfFive = "Best of Five",
  BestOfSeven = "Best of Seven",
}

export function getRoundOrder(round: RoundTypeEnum): number {
  return roundOrderMap[round];
}

export function getRoundTypeByOrder(order: number): RoundTypeEnum {
  switch (order) {
    case 0:
      return RoundTypeEnum.Elimination;
    case 1:
      return RoundTypeEnum.QuarterFinal;
    case 2:
      return RoundTypeEnum.SemiFinal;
    case 3:
      return RoundTypeEnum.Final;
    default:
      return RoundTypeEnum.Elimination;
  }
}

export function isValidOrderTransition(
  fromOrder: number,
  toOrder: number,
  _opts: { categoryHasQuarterFinal: boolean }
): boolean {
  if (fromOrder === 0 && toOrder === 1) return true;
  if (fromOrder === 0 && toOrder === 2) return true;
  if (fromOrder === 1 && toOrder === 2) return true;
  if (fromOrder === 2 && toOrder === 3) return true;

  return false;
}

export type StatusMap = Record<RoundTypeEnum, RoundStateEnum>;

export interface CategoryNodeData {
  category: LeagueCategory;
  viewOnly: boolean;
  [key: string]: unknown;
}

export interface FormatNodeData {
  label: string;
  round_format?: LeagueRoundFormat;
  round_id?: string;
  _isNew?: boolean;
  [key: string]: unknown;
}

export type NodeData = CategoryNodeData | RoundNodeData | FormatNodeData;
