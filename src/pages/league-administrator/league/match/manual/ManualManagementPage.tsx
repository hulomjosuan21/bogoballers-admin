import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ManualMatchConfigFlowProvider,
  useManualMatchConfigFlowDispatch,
} from "@/context/ManualMatchConfigFlowContext";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ContentHeader from "@/components/content-header";
import {
  ManualMatchNodeMenu,
  ManualLeagueTeamNodeMenu,
  ManualRoundNodeMenu,
} from "@/components/manual-match-config/ManualMatchConfigNodeMenus";
import { ManualMatchingCanvas } from "./LeagueMatchManualXyFlowCanvas";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { toast } from "sonner";
import { manualLeagueService } from "@/service/manualLeagueManagementService";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft } from "lucide-react";

function ManualMatchingPageContent() {
  const { activeLeagueId } = useActiveLeague();
  const dispatch = useManualMatchConfigFlowDispatch();

  const handleSyncBracket = async () => {
    if (!activeLeagueId) {
      toast.error("No active league to synchronize.");
      return;
    }

    try {
      toast.info("Synchronizing bracket...");
      const result = await manualLeagueService.synchronizeBracket(
        activeLeagueId
      );

      const updatedState = await manualLeagueService.getFlowState(
        activeLeagueId
      );
      dispatch({ type: "SET_STATE", payload: updatedState });

      toast.success(`${result.teams_progressed} teams have been progressed.`);
    } catch (error) {
      toast.error("Failed to synchronize bracket.");
      console.error(error);
    }
  };

  const rightMenu = (
    <div className="w-fit flex flex-col gap-2">
      <Tabs
        defaultValue="match-types"
        className="text-xs text-muted-foreground"
      >
        <TabsList size="xs">
          <TabsTrigger value="match-types" className="text-xs">
            Match templates
          </TabsTrigger>
          <TabsTrigger value="round">Round</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>
        <TabsContent value="match-types">
          <ManualMatchNodeMenu />
        </TabsContent>
        <TabsContent value="round">
          <ManualRoundNodeMenu />
        </TabsContent>
        <TabsContent value="teams">
          <ManualLeagueTeamNodeMenu />
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <ContentShell>
      <ContentHeader title="Manual Configuration">
        <Button onClick={handleSyncBracket} size="sm" className="">
          <ArrowRightLeft className="w-4 h-4" />
          Sync
        </Button>
      </ContentHeader>
      <ContentBody className="flex-row flex">
        <ManualMatchingCanvas />
        {rightMenu}
      </ContentBody>
    </ContentShell>
  );
}

export default function ManualMatchingPage() {
  return (
    <ManualMatchConfigFlowProvider>
      <ManualMatchingPageContent />
    </ManualMatchConfigFlowProvider>
  );
}
