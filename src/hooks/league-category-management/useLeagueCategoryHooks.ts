import { LeagueCategoryRoundService } from "@/service/leagueCategoryManagementService";
import { createUpdateRoundStore } from "@/stores/updateRoundStore";

export const useUpdateRoundProgressionStore = createUpdateRoundStore(
  LeagueCategoryRoundService.progressRound
);
