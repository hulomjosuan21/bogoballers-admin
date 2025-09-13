import { LeagueCategoryRoundService } from "@/service/leagueCategory";
import { createUpdateRoundStore } from "@/stores/updateRoundStore";

export const useUpdateRoundProgressionStore = createUpdateRoundStore(
  LeagueCategoryRoundService.progressRound
);
