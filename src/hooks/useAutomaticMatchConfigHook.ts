import {
  useAutomaticMatchConfigFlowDispatch,
  useAutomaticMatchConfigFlowState,
} from "@/context/AutomaticMatchConfigFlowContext";
import type { AutomaticMatchConfigFlowNode } from "@/types/automaticMatchConfigTypes";
import {
  useReactFlow,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
  type EdgeChange,
} from "@xyflow/react";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { autoMatchConfigService } from "@/service/automaticMatchConfigService";

export function useAutomaticMatchConfigDragAndDrop() {
  const { screenToFlowPosition } = useReactFlow();
  const dispatch = useAutomaticMatchConfigFlowDispatch();

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const payloadString = event.dataTransfer.getData(
        "application/reactflow-node"
      );
      if (!payloadString) return;

      try {
        const payload: Omit<AutomaticMatchConfigFlowNode, "position"> =
          JSON.parse(payloadString);
        const newNode: AutomaticMatchConfigFlowNode = {
          ...payload,
          position: screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          }),
        };
        dispatch({ type: "ADD_NODE", payload: newNode });
      } catch (error) {
        toast.error("Could not add node to canvas.");
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

export function useManageAutomaticMatchConfigNode() {
  const { nodes, edges } = useAutomaticMatchConfigFlowState();
  const dispatch = useAutomaticMatchConfigFlowDispatch();
  const { onDrop, onDragOver } = useAutomaticMatchConfigDragAndDrop();
  const { activeLeagueId } = useActiveLeague();
  const nodesRef = useRef(nodes);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // load initial state
  useEffect(() => {
    if (!activeLeagueId) return;
    const load = async () => {
      try {
        toast.info("Loading auto match config...");
        const state = await autoMatchConfigService.getFlowState(activeLeagueId);
        dispatch({ type: "SET_STATE", payload: state });
        toast.success("Loaded auto config layout.");
      } catch (err) {
        toast.error("Failed to load auto config state.");
      }
    };
    load();
  }, [activeLeagueId, dispatch]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      dispatch({ type: "ON_NODES_CHANGE", payload: changes });
    },
    [dispatch]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    async (changes) => {
      const deletions: EdgeChange[] = [];
      for (const c of changes) {
        if (c.type === "remove") {
          try {
            await autoMatchConfigService.deleteEdge(c.id);
            toast.success("Edge deleted.");
            deletions.push(c);
          } catch {
            toast.error("Failed to delete edge.");
          }
        }
      }
      if (deletions.length > 0) {
        dispatch({ type: "ON_EDGES_CHANGE", payload: changes });
      }
    },
    [dispatch]
  );

  const onConnect: OnConnect = useCallback(
    async (connection: Connection) => {
      if (!activeLeagueId) {
        toast.error("No active league.");
        return;
      }

      const src = nodesRef.current.find((n) => n.id === connection.source);
      const dst = nodesRef.current.find((n) => n.id === connection.target);
      if (!src || !dst) {
        toast.error("Invalid connection.");
        return;
      }

      // Validate allowed connections:
      const valid =
        (src.type === "leagueCategory" && dst.type === "leagueCategoryRound") ||
        (src.type === "leagueCategoryRound" &&
          dst.type === "leagueCategoryRound") ||
        (src.type === "roundFormat" && dst.type === "leagueCategoryRound");

      if (!valid) {
        toast.error("Not a valid connection.");
        return;
      }

      const leagueCategoryId =
        src.type === "leagueCategory"
          ? src.id
          : src.data.type === "league_category_round"
          ? src.data.round.league_category_id
          : dst.data.round.league_category_id;

      try {
        const edge = await autoMatchConfigService.createEdge({
          league_id: activeLeagueId,
          league_category_id: leagueCategoryId,
          source: connection.source!,
          target: connection.target!,
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
        });
        dispatch({ type: "ON_CONNECT", payload: edge });
      } catch {
        toast.error("Failed to create edge.");
      }
    },
    [dispatch, activeLeagueId]
  );

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    onDragOver,
  };
}
