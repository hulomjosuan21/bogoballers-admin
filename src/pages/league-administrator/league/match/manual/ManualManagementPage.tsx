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
import { useFetchLeagueGenericData } from "@/hooks/useFetchLeagueGenericData";
import type { League } from "@/types/league";

function ManualMatchingPageContent() {
  const {
    leagueId: activeLeagueId,
    isLoading: activeLeagueLoading,
    error: activeLeagueError,
  } = useFetchLeagueGenericData<League>({
    params: { active: true, status: ["Scheduled", "Ongoing"] },
  });

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

  if (activeLeagueLoading) {
    return (
      <div className="h-screen grid place-content-center">
        <Spinner />
      </div>
    );
  }

  if (activeLeagueError) {
    return (
      <div className="h-screen grid place-content-center">
        <p className="text-sm text-red-500">
          {activeLeagueError.message || "Error loading league config"}
        </p>
      </div>
    );
  }

  return (
    <ContentShell>
      <ContentHeader title="Manual Configuration" />
      <ContentBody className="flex-row flex">
        <ManualMatchingCanvas activeLeagueId={activeLeagueId} />
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
