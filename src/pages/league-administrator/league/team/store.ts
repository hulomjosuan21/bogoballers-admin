import { LeagueTeamService } from "@/service/league-team-service";
import { createDeleteStore } from "@/stores/deleteStore";
import { createDialogStore } from "@/stores/dialogStore";
import { createUpdateStore } from "@/stores/updateStore";
import type { LeagueTeamModel } from "@/types/team";

export const useCheckPlayerSheet = createDialogStore<LeagueTeamModel>();
export const useUpdateTeamStore = createUpdateStore<LeagueTeamModel>(
  LeagueTeamService.updateOne
);

export const useDeleteTeamStore = createDeleteStore(
  LeagueTeamService.deleteOne
);
