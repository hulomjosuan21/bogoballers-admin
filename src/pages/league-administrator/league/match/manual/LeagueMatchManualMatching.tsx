import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useReactFlow,
  ReactFlowProvider,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
  type Node,
} from "@xyflow/react";
import { v4 as uuidv4 } from "uuid";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FlowProvider,
  useFlowDispatch,
  useFlowState,
} from "@/context/FlowContext";
import type { FlowNode, IGroup, LeagueMatchNodeData } from "@/types/manual";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { type LeagueCategory } from "@/types/leagueCategoryTypes";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ContentHeader from "@/components/content-header";
import { nodeTypes } from "@/components/manual";
import {
  ManualEmptyLeagueMatchNode,
  ManualLeagueTeamNodeMenu,
  ManualRoundNodeMenu,
} from "@/components/manual/menus";
import type { LeagueMatch } from "@/types/leagueMatch";

function useDragAndDrop() {
  const { screenToFlowPosition } = useReactFlow();
  const dispatch = useFlowDispatch();

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const payloadString = event.dataTransfer.getData(
        "application/reactflow-node"
      );
      if (!payloadString) return;

      try {
        const payload: Omit<FlowNode, "position"> = JSON.parse(payloadString);
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        const newNode: FlowNode = { ...payload, position };
        dispatch({ type: "ADD_NODE", payload: newNode });
      } catch {
        console.error("Invalid node payload dropped on canvas");
      }
    },
    [screenToFlowPosition, dispatch]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return { onDrop, onDragOver };
}

function ManualMatchingCanvas() {
  const { nodes, edges } = useFlowState();
  const dispatch = useFlowDispatch();
  const { onDrop, onDragOver } = useDragAndDrop();

  const onNodesChange: OnNodesChange = (changes) =>
    dispatch({ type: "ON_NODES_CHANGE", payload: changes });
  const onEdgesChange: OnEdgesChange = (changes) =>
    dispatch({ type: "ON_EDGES_CHANGE", payload: changes });

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      dispatch({ type: "ON_CONNECT", payload: connection });

      const { source, sourceHandle, target } = connection;
      if (!source || !target || !sourceHandle) return;

      const sourceNode = nodes.find((n) => n.id === source);
      const targetNode = nodes.find((n) => n.id === target);

      if (!sourceNode || !targetNode) return;

      if (
        sourceNode.type === "leagueCategory" &&
        targetNode.type === "leagueCategoryRound"
      ) {
        let round_order = -1;
        if (sourceHandle === "elimination") round_order = 0;
        if (sourceHandle === "quarterfinal") round_order = 1;
        if (sourceHandle === "semifinal") round_order = 2;
        if (sourceHandle === "final") round_order = 99;

        dispatch({
          type: "UPDATE_NODE_DATA",
          payload: {
            nodeId: target,
            data: { round: { league_category_id: source, round_order } },
          },
        });
      }

      if (
        sourceNode.type === "leagueMatch" &&
        targetNode.type === "leagueMatch" &&
        targetNode.data.type === "league_match"
      ) {
        const isWinnerProgression = sourceHandle.startsWith("winner-");

        const updatedSourceMatch: Partial<LeagueMatch> = isWinnerProgression
          ? { next_match_id: target }
          : { loser_next_match_id: target };

        const sourceUpdateData: Partial<LeagueMatchNodeData> = {
          league_match: updatedSourceMatch,
        };

        dispatch({
          type: "UPDATE_NODE_DATA",
          payload: {
            nodeId: source,
            data: sourceUpdateData,
          },
        });

        const updatedTargetMatch: Partial<LeagueMatch> = {
          depends_on_match_ids: [
            ...(targetNode.data.league_match.depends_on_match_ids || []),
            source,
          ],
        };

        const targetUpdateData: Partial<LeagueMatchNodeData> = {
          league_match: updatedTargetMatch,
        };

        dispatch({
          type: "UPDATE_NODE_DATA",
          payload: {
            nodeId: target,
            data: targetUpdateData,
          },
        });
      }
    },
    [dispatch, nodes]
  );

  return (
    <div className="h-full border rounded-md w-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export function ManualLeagueCategoryNodeMenu() {
  const { activeLeagueCategories } = useActiveLeague();

  const onDragStart = (event: React.DragEvent, category: LeagueCategory) => {
    const nodePayload: Omit<Node, "position"> = {
      id: category.league_category_id,
      type: "leagueCategory",
      data: { type: "league_category", league_category: category },
    };
    event.dataTransfer.setData(
      "application/reactflow-node",
      JSON.stringify(nodePayload)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex flex-col gap-2 justify-center">
      {activeLeagueCategories.map((value) => (
        <div
          key={value.league_category_id}
          onDragStart={(event) => onDragStart(event, value)}
          draggable
          className="w-48 flex items-center gap-2 p-2 rounded-md border bg-card cursor-grab hover:opacity-80"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-card-foreground">
            {value.category_name}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ManualGroupNodeMenu() {
  const [groups, setGroups] = useState<IGroup[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    const newGroup: IGroup = {
      display_name: inputValue.trim(),
      group_id: uuidv4(),
    };
    setGroups((prev) => [...prev, newGroup]);
    setInputValue("");
  };

  const onDragStart = (event: React.DragEvent, group: IGroup) => {
    const groupId = uuidv4();
    const nodePayload: Omit<Node, "position"> = {
      id: groupId,
      type: "group",
      data: { type: "group", group: { ...group, group_id: groupId } },
    };
    event.dataTransfer.setData(
      "application/reactflow-node",
      JSON.stringify(nodePayload)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="p-2 bg-card rounded-md">
      <div className="flex gap-2 mb-3">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter group name"
          className="w-32 h-8"
        />
        <Button onClick={handleAdd} size="sm" variant="outline" className="h-8">
          Add
        </Button>
      </div>
      <div className="flex flex-col gap-2 justify-center">
        {groups.map((value, index) => (
          <div
            key={index}
            onDragStart={(event) => onDragStart(event, value)}
            draggable
            className="w-48 flex items-center gap-2 p-2 rounded-md border bg-card cursor-grab hover:opacity-80"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-card-foreground">
              {value.display_name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ManualMatchingPageContent() {
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
      <ContentHeader title="Manual Matching" />
      <ContentBody className="flex-row ">
        <ManualMatchingCanvas />
        {rightMenu}
      </ContentBody>
    </ContentShell>
  );
}

export default function ManualMatchingPage() {
  return (
    <ReactFlowProvider>
      <FlowProvider>
        <ManualMatchingPageContent />
      </FlowProvider>
    </ReactFlowProvider>
  );
}
