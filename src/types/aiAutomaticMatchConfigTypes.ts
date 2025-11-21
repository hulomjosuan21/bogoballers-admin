import type { LeagueCategoryRound } from "./leagueCategoryTypes";

export interface AICommissionerResponse {
  status: "success" | "error" | "warning";
  message?: string;
  explanation?: string;
  actions_taken?: {
    matches_created: number;
    teams_updated: number;
  };
}

export interface AutomaticMatchConfigLeagueCategoryRoundNodeData {
  round: LeagueCategoryRound;
  onUpdate?: () => void;
}
