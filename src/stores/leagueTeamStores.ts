import { LeagueTeamService } from "@/service/leagueTeamService";
import { createDeleteStore } from "@/stores/deleteStore";
import { createPopUpStore } from "@/stores/dialogStore";
import { createUpdateStore } from "@/stores/updateStore";
import type { LeagueTeamForMatch, LeagueTeamModel } from "@/types/team";
import { createRefundStore } from "./refundStore";
import { useToggleStore } from "./toggleStore";

export const useCheckPlayerSheet = createPopUpStore<LeagueTeamModel>();
export const useRefundDialog = createRefundStore();
export const useUpdateLeagueTeamStore = createUpdateStore<LeagueTeamModel>(
  LeagueTeamService.updateOne
);

export const useRemoveLeagueTeamStore = createDeleteStore(
  LeagueTeamService.deleteOne
);

export const useToggleOfficialLeagueTeamSection =
  useToggleStore<LeagueTeamForMatch>();
