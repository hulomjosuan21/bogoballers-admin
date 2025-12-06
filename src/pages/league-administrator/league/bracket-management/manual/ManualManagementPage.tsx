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
import { memo, Suspense, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner";
import useActiveLeagueMeta from "@/hooks/useActiveLeagueMeta";
import {
  NoActiveLeagueAlert,
  PendingLeagueAlert,
} from "@/components/LeagueStatusAlert";
const ManualMatchFlowEditor = memo(
  ({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    onDragOver,
    onNodeDragStop,
    theme,
  }: any) => {
    return (
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
    );
  }
);
function ManualMatchingPageContent() {
  const {
    league_id: activeLeagueId,
    league_status,
    message,
    isActive,
  } = useActiveLeagueMeta();
  const [isPending, startTransition] = useTransition();

  const validate: boolean = !!(
    isActive &&
    league_status &&
    ["Scheduled", "Ongoing"].includes(league_status)
  );

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
  } = useManageManualMatchConfigNode(activeLeagueId, validate);

  const { theme } = useTheme();

  const handleRefresh = () => {
    startTransition(async () => {
      await queryClient.invalidateQueries({
        queryKey: ["manual-match-config-flow", activeLeagueId],
        exact: true,
      });

      toast.success("Data refreshed!");
    });
  };

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
          <Suspense
            key="team"
            fallback={
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            }
          >
            <ManualLeagueTeamNodeMenu />
          </Suspense>
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

  if (!isActive) {
    return (
      <NoActiveLeagueAlert message={message ?? "No active league found."} />
    );
  }

  if (isActive && league_status === "Pending") {
    return <PendingLeagueAlert />;
  }

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
          <ManualMatchFlowEditor
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeDragStop={onNodeDragStop}
            theme={theme}
          />
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
