import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AutomaticFormatNodeMenu,
  AutomaticRoundNodeMenu,
} from "@/components/automatic-match-config/AutomaticMatchConfigNodeMenu";
import { AutomaticMatchConfigFlowProvider } from "@/context/AutomaticMatchConfigFlowContext";
import { AutomaticMatchConfigXyFlowCanvas } from "./AutomaticMatchConfigXyFlowCanvas";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import { useLeagueStore } from "@/stores/leagueStore";
import SelectedLeagueStateScreen from "@/components/selectedLeagueStateScreen";
import type { LeagueStatus } from "@/service/leagueService";

function AutomaticMatchConfigPage() {
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
    Rejected: true,
  };

  if (handledStates[leagueStatus]) {
    return <SelectedLeagueStateScreen state={leagueStatus} league={league} />;
  }

  const menu = (
    <div className="w-48 flex flex-col gap-2">
      <Tabs defaultValue="rounds" className="text-xs text-muted-foreground">
        <TabsList size="xs" className="grid w-full grid-cols-2">
          <TabsTrigger value="rounds">Rounds</TabsTrigger>
          <TabsTrigger value="formats">Formats</TabsTrigger>
        </TabsList>
        <TabsContent value="rounds">
          <AutomaticRoundNodeMenu />
        </TabsContent>
        <TabsContent value="formats">
          <AutomaticFormatNodeMenu />
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <ContentShell>
      <ContentHeader title="Automatic Configuration" />
      <ContentBody className="flex flex-row">
        <AutomaticMatchConfigXyFlowCanvas activeLeagueId={leagueId} />
        {menu}
      </ContentBody>
    </ContentShell>
  );
}

export default function AutomaticMatchConfigContent() {
  return (
    <AutomaticMatchConfigFlowProvider>
      <Suspense
        fallback={
          <div className="h-screen grid place-content-center">
            <Spinner />
          </div>
        }
      >
        <AutomaticMatchConfigPage />
      </Suspense>
    </AutomaticMatchConfigFlowProvider>
  );
}
