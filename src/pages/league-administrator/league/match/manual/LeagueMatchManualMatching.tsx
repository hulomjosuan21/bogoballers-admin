import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlowProvider, useFlowDispatch } from "@/context/FlowContext";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ContentHeader from "@/components/content-header";
import {
  ManualEmptyLeagueMatchNode,
  ManualLeagueCategoryNodeMenu,
  ManualLeagueTeamNodeMenu,
  ManualRoundNodeMenu,
} from "@/components/manual-management/ManualNodeMenus";
import { ManualMatchingCanvas } from "./LeagueMatchManualXyFlowCanvas";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { toast } from "sonner";
import { manualLeagueService } from "@/service/manualLeagueManagementService";
import { Button } from "@/components/ui/button";
import { ArrowRightFromLine } from "lucide-react";

function ManualMatchingPageContent() {
  const { activeLeagueId } = useActiveLeague();
  const dispatch = useFlowDispatch();

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
      <ManualEmptyLeagueMatchNode leagueId="" />
      <Tabs
        defaultValue="category"
        className="w-fit text-xs text-muted-foreground"
      >
        <TabsList size="xs">
          <TabsTrigger value="category">Category</TabsTrigger>
          <TabsTrigger value="round">Round</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>
        <TabsContent value="category">
          <ManualLeagueCategoryNodeMenu />
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
      <ContentHeader title="Manual Matching">
        <Button onClick={handleSyncBracket} size="sm">
          <ArrowRightFromLine />
          Sync Bracket
        </Button>
      </ContentHeader>
      <ContentBody className="flex-row ">
        <ManualMatchingCanvas />
        {rightMenu}
      </ContentBody>
    </ContentShell>
  );
}

export default function ManualMatchingPage() {
  return (
    <FlowProvider>
      <ManualMatchingPageContent />
    </FlowProvider>
  );
}
