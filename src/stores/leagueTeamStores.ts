import { LeagueTeamService } from "@/service/leagueTeamService";
import { createDeleteStore } from "@/stores/deleteStore";
import { createPopUpStore } from "@/stores/dialogStore";
import { createUpdateStore } from "@/stores/updateStore";
import { createRefundStore } from "./refundStore";
import { useToggleStore } from "./toggleStore";
import type { LeagueTeam } from "@/types/team";

export const useCheckPlayerSheet = createPopUpStore<LeagueTeam>();
export const useRefundDialog = createRefundStore();
export const useUpdateLeagueTeamStore = createUpdateStore<LeagueTeam>(
  LeagueTeamService.updateOne
);

export const useRemoveLeagueTeamStore = createDeleteStore(
  LeagueTeamService.deleteOne
);

export const useToggleOfficialLeagueTeamSection = useToggleStore<LeagueTeam>();
