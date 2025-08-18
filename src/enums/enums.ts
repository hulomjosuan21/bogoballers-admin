export enum AccountTypeEnum {
  PLAYER = "Player",
  TEAM_CREATOR = "Team_Creator",
  LOCAL_ADMINISTRATOR = "League_Administrator_Local",
  LGU_ADMINISTRATOR = "League_Administrator_LGU",
  SYSTEM = "System",
}

export enum RoundTypeEnum {
  Elimination = "Elimination",
  QuarterFinal = "Quarterfinal",
  SemiFinal = "Semifinal",
  Final = "Final",
}

const roundOrderMap: Record<RoundTypeEnum, number> = {
  [RoundTypeEnum.Elimination]: 0,
  [RoundTypeEnum.QuarterFinal]: 1,
  [RoundTypeEnum.SemiFinal]: 2,
  [RoundTypeEnum.Final]: 3,
};

export function getRoundOrder(round: RoundTypeEnum): number {
  return roundOrderMap[round];
}

export enum RoundFormatEnum {
  RoundRobin = "Round Robin",
  Knockout = "Knockout",
  DoubleElimination = "Double Elimination",
  TwiceToBeat = "Twice-to-Beat",
  BestOfThree = "Best-of-3",
  BestOfFive = "Best-of-5",
  BestOfSeven = "Best-of-7",
}

export enum RoundStateEnum {
  Upcoming = "Upcoming",
  Ongoing = "Ongoing",
  Finished = "Finished",
}
