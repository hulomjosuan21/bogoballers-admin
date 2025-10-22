import ManualMatchConfigGroupNode from "./ManualMatchConfigGroupNode";
import ManualMatchConfigLeagueCategoryNode from "./ManualMatchConfigLeagueCategoryNode";
import ManualMatchConfigLeagueCategoryRoundNode from "./ManualMatchConfigLeagueCategoryRoundNode";
import ManualMatchConfigLeagueMatchNode from "./ManualMatchConfigLeagueMatchNode";

export const manualMatchConfigNodeTypes = {
  leagueCategory: ManualMatchConfigLeagueCategoryNode,
  leagueCategoryRound: ManualMatchConfigLeagueCategoryRoundNode,
  group: ManualMatchConfigGroupNode,
  leagueMatch: ManualMatchConfigLeagueMatchNode,
};
