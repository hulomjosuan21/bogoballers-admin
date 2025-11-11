import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManualMatchConfigFlowProvider } from "@/context/ManualMatchConfigFlowContext";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ContentHeader from "@/components/content-header";
import {
  ManualMatchNodeMenu,
  ManualLeagueTeamNodeMenu,
  ManualRoundNodeMenu,
} from "@/components/manual-match-config/ManualMatchConfigNodeMenus";
import { ManualMatchingCanvas } from "./LeagueMatchManualXyFlowCanvas";

import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import SelectedLeagueStateScreen from "@/components/selectedLeagueStateScreen";
import { useLeagueStore } from "@/stores/leagueStore";
import type { LeagueStatus } from "@/service/leagueService";

function ManualMatchingPageContent() {
  const { league, isLoading, leagueId } = useLeagueStore();

  if (isLoading) {
    return <SelectedLeagueStateScreen loading />;
  }

  if (!league || !leagueId) {
    return <SelectedLeagueStateScreen />;
  }

  const leagueStatus = league.status as LeagueStatus;

  const handledStates: Record<LeagueStatus, boolean> = {
    Pending: true,
    Completed: true,
    Postponed: true,
    Cancelled: true,
    Scheduled: false,
    Ongoing: false,
  };

  if (handledStates[leagueStatus]) {
    return <SelectedLeagueStateScreen state={leagueStatus} league={league} />;
  }

  const rightMenu = (
    <div className="w-fit flex flex-col gap-2">
      <Tabs
        defaultValue="match-types"
        className="text-xs text-muted-foreground"
      >
        <TabsList size="xs" className="">
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
      <ContentHeader title="Manual Configuration" />
      <ContentBody className="flex-row flex">
        <ManualMatchingCanvas activeLeagueId={leagueId} />
        {rightMenu}
      </ContentBody>
    </ContentShell>
  );
}

export default function ManualMatchingPage() {
  return (
    <ManualMatchConfigFlowProvider>
      <Suspense
        fallback={
          <div className="h-screen grid place-content-center">
            <Spinner />
          </div>
        }
      >
        <ManualMatchingPageContent />
      </Suspense>
    </ManualMatchConfigFlowProvider>
  );
}
