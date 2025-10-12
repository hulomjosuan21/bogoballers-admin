import ManualMatchConfigGroupNode from "./ManualMatchConfigGroupNode";
import ManualMatchConfigLeagueCategoryNode from "./ManualMatchConfigLeagueCategoryNode";
import ManualMatchConfigLeagueCategoryRoundNode from "./ManualMatchConfigLeagueCategoryRoundNode";
import ManualMatchConfigLeagueMatchNode from "./ManualMatchConfigLeagueMatchNode";

export const manualMatchConfigNodeTypes = {
  manualMatchConfigleagueCategory: ManualMatchConfigLeagueCategoryNode,
  manualMatchConfigleagueCategoryRound:
    ManualMatchConfigLeagueCategoryRoundNode,
  manualMatchConfigGroup: ManualMatchConfigGroupNode,
  manualMatchConfigleagueMatch: ManualMatchConfigLeagueMatchNode,
};
