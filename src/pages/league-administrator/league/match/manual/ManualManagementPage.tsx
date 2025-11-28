import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManualMatchConfigFlowProvider } from "@/context/ManualMatchConfigFlowContext";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ContentHeader from "@/components/content-header";
import {
  ManualMatchNodeMenu,
  ManualLeagueTeamNodeMenu,
  ManualRoundNodeMenu,
} from "@/components/manual-match-config/ManualMatchConfigNodeMenus";
import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";

import { useManageManualMatchConfigNode } from "@/hooks/useManualMatchConfigHook";
import { manualMatchConfigNodeTypes } from "@/components/manual-match-config";
import { useTheme } from "@/providers/theme-provider";

import { Spinner } from "@/components/ui/spinner";
import { Suspense, useTransition } from "react";
import SelectedLeagueStateScreen from "@/components/selectedLeagueStateScreen";
import { useLeagueStore } from "@/stores/leagueStore";
import type { LeagueStatus } from "@/service/leagueService";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner";

function ManualMatchingPageContent() {
  const { league, isLoading, leagueId } = useLeagueStore();
  const [isPending, startTransition] = useTransition();

  const {
    changeType,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    onDragOver,
    onNodeDragStop,
  } = useManageManualMatchConfigNode(leagueId);
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
        queryKey: ["your-key"],
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

  const changesText = () => {
    switch (changeType) {
      case "Position":
        return <span className="text-xs font-medium">Position changed!</span>;
      default:
        return null;
    }
  };

  return (
    <ContentShell>
      <ContentHeader title="Manual Configuration">
        {changesText()}
        <Button
          className="size-7"
          variant="ghost"
          onClick={handleRefresh}
          disabled={isPending}
        >
          <RefreshCw className={`w-3 h-3 ${isPending ? "animate-spin" : ""}`} />
        </Button>
      </ContentHeader>
      <ContentBody className="flex-row flex">
        <div className="h-full border rounded-md w-full bg-background">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeDragStop={onNodeDragStop}
            colorMode={theme}
            nodeTypes={manualMatchConfigNodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
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
