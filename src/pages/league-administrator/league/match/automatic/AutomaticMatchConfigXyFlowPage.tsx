import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AutomaticFormatNodeMenu,
  AutomaticRoundNodeMenu,
} from "@/components/automatic-match-config/AutomaticMatchConfigNodeMenu";
import { AutomaticMatchConfigFlowProvider } from "@/context/AutomaticMatchConfigFlowContext";
import { Spinner } from "@/components/ui/spinner";
import { Suspense, useTransition } from "react";
import { useLeagueStore } from "@/stores/leagueStore";
import SelectedLeagueStateScreen from "@/components/selectedLeagueStateScreen";
import type { LeagueStatus } from "@/service/leagueService";
import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import { automaticMatchConfigNodeTypes } from "@/components/automatic-match-config";
import { useManageAutomaticMatchConfigNode } from "@/hooks/useAutomaticMatchConfigHook";
import { useTheme } from "@/providers/theme-provider";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

function AutomaticMatchConfigPage() {
  const { league, isLoading, leagueId } = useLeagueStore();
  const [isPending, startTransition] = useTransition();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    onDragOver,
    onNodeDragStop,
  } = useManageAutomaticMatchConfigNode(leagueId);

  const { theme } = useTheme();
  if (isLoading) {
    return <SelectedLeagueStateScreen loading />;
  }

  if (!league || !leagueId) {
    return <SelectedLeagueStateScreen />;
  }

  const leagueStatus = league.status as LeagueStatus;
  const handleRefresh = () => {
    startTransition(async () => {
      await queryClient.invalidateQueries({
        queryKey: ["auto-match-config-flow", leagueId],
        exact: true,
      });

      toast.success("Data refreshed!");
    });
  };
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
      <ContentHeader title="Automatic Configuration">
        <Button
          className="size-7"
          variant="ghost"
          onClick={handleRefresh}
          disabled={isPending}
        >
          <RefreshCw className={`w-3 h-3 ${isPending ? "animate-spin" : ""}`} />
        </Button>
      </ContentHeader>
      <ContentBody className="flex flex-row">
        <div className="h-full w-full border rounded-md bg-background">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={automaticMatchConfigNodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            colorMode={theme}
            onDragOver={onDragOver}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
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
