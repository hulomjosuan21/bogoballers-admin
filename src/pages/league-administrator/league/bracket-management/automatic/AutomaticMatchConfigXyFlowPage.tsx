import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AutomaticFormatNodeMenu,
  AutomaticRoundNodeMenu,
} from "@/components/automatic-match-config/AutomaticMatchConfigNodeMenu";
import { AutomaticMatchConfigFlowProvider } from "@/context/AutomaticMatchConfigFlowContext";
import { Spinner } from "@/components/ui/spinner";
import { memo, Suspense, useTransition } from "react";
import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import { automaticMatchConfigNodeTypes } from "@/components/automatic-match-config";
import { useManageAutomaticMatchConfigNode } from "@/hooks/useAutomaticMatchConfigHook";
import { useTheme } from "@/providers/theme-provider";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import useActiveLeagueMeta from "@/hooks/useActiveLeagueMeta";
import {
  NoActiveLeagueAlert,
  PendingLeagueAlert,
} from "@/components/LeagueStatusAlert";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useOpenAutomaticMatchesSheet } from "@/stores/automaticMatchStore";
import { ToggleState } from "@/stores/toggleStore";
import { AutomaticMatchesTable } from "./match-sheet-components/matchSheetTable";
const MatchFlowEditor = memo(
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
    );
  }
);
function AutomaticMatchConfigPage() {
  const { data, state, reset } = useOpenAutomaticMatchesSheet();
  const {
    league_id: activeLeagueId,
    league_status,
    message,
    isActive,
  } = useActiveLeagueMeta();

  const validate: boolean = !!(
    isActive &&
    league_status &&
    ["Scheduled", "Ongoing"].includes(league_status)
  );
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
  } = useManageAutomaticMatchConfigNode(activeLeagueId, validate);

  const { theme } = useTheme();

  const handleRefresh = () => {
    startTransition(async () => {
      await queryClient.invalidateQueries({
        queryKey: ["auto-match-config-flow", activeLeagueId],
        exact: true,
      });

      toast.success("Data refreshed!");
    });
  };

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
        <Sheet
          key={`${data?.round_id}-sheet`}
          open={state == ToggleState.OPEN_AUTOMATIC_MATCH_SHEET && !!data}
          onOpenChange={reset}
        >
          <SheetContent
            side="top"
            className="max-h-[80vh] overflow-y-auto"
            aria-describedby={undefined}
          >
            <SheetHeader>
              <SheetTitle>{data?.round_name} Round Matches</SheetTitle>
            </SheetHeader>
            <div className="">
              {data?.round_id && (
                <Suspense
                  fallback={
                    <div className="flex h-[200px] w-full items-center justify-center border rounded-md bg-muted/10">
                      <Spinner />
                    </div>
                  }
                >
                  <AutomaticMatchesTable roundId={data.round_id} />
                </Suspense>
              )}
            </div>
          </SheetContent>
        </Sheet>
        <div className="h-full w-full border rounded-md bg-background">
          <MatchFlowEditor
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
