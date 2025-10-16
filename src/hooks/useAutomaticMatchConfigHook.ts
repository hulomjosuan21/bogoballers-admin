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
  type EdgeChange,
  type Node,
  type NodeChange,
  type Connection,
} from "@xyflow/react";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { autoMatchConfigService } from "@/service/automaticMatchConfigService";

const PERM_PREFIXES = ["league-category-", "lround-", "lformat-"];
const isPermanentId = (id: string) =>
  PERM_PREFIXES.some((p) => id.startsWith(p));

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
      } catch {
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
  const { activeLeagueId } = useActiveLeague();
  const { nodes, edges } = useAutomaticMatchConfigFlowState();
  const dispatch = useAutomaticMatchConfigFlowDispatch();
  const { onDrop, onDragOver } = useAutomaticMatchConfigDragAndDrop();
  const nodesRef = useRef(nodes);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    if (!activeLeagueId) return;
    (async () => {
      try {
        toast.info("Loading automatic layout...");
        const initialState = await autoMatchConfigService.getFlowState(
          activeLeagueId
        );
        if (initialState.nodes && initialState.edges) {
          dispatch({ type: "SET_STATE", payload: initialState });
          toast.success("Automatic layout loaded!");
        }
      } catch {
        toast.error("Failed to load automatic layout.");
      }
    })();
  }, [activeLeagueId, dispatch]);

  const onNodeDragStop = useCallback(
    async (_event: React.MouseEvent, node: Node) => {
      if (!isPermanentId(node.id)) return;
      try {
        await autoMatchConfigService.updateNodePosition(
          node.type!,
          node.id,
          node.position
        );
      } catch {
        toast.error("Failed to update node position.");
      }
    },
    []
  );

  const onNodesChange: OnNodesChange = useCallback(
    async (changes) => {
      const toDispatch: NodeChange[] = [];

      for (const change of changes) {
        if (change.type === "remove") {
          const node = nodes.find((n) => n.id === change.id);
          if (!node) continue;

          if (node.type === "leagueCategory") {
            toast.error("League Category nodes cannot be deleted.");
            return;
          }

          if (!isPermanentId(node.id)) {
            toDispatch.push(change);
            continue;
          }

          try {
            await autoMatchConfigService.deleteNode(node.type!, node.id);
            toDispatch.push(change);
          } catch {
            toDispatch.push(change);
          }
        } else {
          toDispatch.push(change);
        }
      }

      if (toDispatch.length > 0) {
        dispatch({ type: "ON_NODES_CHANGE", payload: toDispatch });
      }
    },
    [dispatch, nodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    async (changes) => {
      const toDispatch: EdgeChange[] = [];
      for (const change of changes) {
        if (change.type === "remove") {
          try {
            await autoMatchConfigService.deleteEdge(change.id);
            toDispatch.push(change);
            toast.success("Edge deleted.");
          } catch {
            toast.error("Failed to delete edge.");
          }
        } else {
          toDispatch.push(change);
        }
      }
      if (toDispatch.length > 0) {
        dispatch({ type: "ON_EDGES_CHANGE", payload: toDispatch });
      }
    },
    [dispatch]
  );

  const onConnect: OnConnect = useCallback(
    async (conn: Connection) => {
      if (!activeLeagueId) return;
      const { source, target, sourceHandle, targetHandle } = conn;
      if (!source || !target) return;

      const src = nodesRef.current.find((n) => n.id === source);
      const dst = nodesRef.current.find((n) => n.id === target);
      if (!src || !dst) return;

      let valid = false;
      if (src.type === "leagueCategory" && dst.type === "leagueCategoryRound") {
        valid = true;
      } else if (
        src.type === "leagueCategoryRound" &&
        dst.type === "leagueCategoryRound"
      ) {
        valid = true;
      } else if (
        src.type === "roundFormat" &&
        dst.type === "leagueCategoryRound"
      ) {
        valid = true;
      }

      if (!valid) {
        toast.error("Invalid connection.");
        return;
      }

      const tempEdgeId = `temp-${Math.random()}`;
      dispatch({ type: "ON_CONNECT", payload: { ...conn, id: tempEdgeId } });

      try {
        if (
          src.type === "leagueCategory" &&
          dst.type === "leagueCategoryRound" &&
          dst.data.type === "league_category_round"
        ) {
          if (dst.data.round?.round_order !== 0) {
            toast.error(
              "The first round of a category must be Elimination (order 0)."
            );
            dispatch({
              type: "ON_EDGES_CHANGE",
              payload: [{ id: tempEdgeId, type: "remove" }],
            });
            return;
          }

          if (!isPermanentId(dst.id)) {
            const newRound = await autoMatchConfigService.createRound({
              league_category_id: src.id,
              round_name: dst.data.league_category_round,
              round_order: dst.data.round?.round_order ?? 0,
              position: dst.position!,
            });
            const finalNode: AutomaticMatchConfigFlowNode = {
              ...dst,
              id: newRound.round_id,
              data: { ...dst.data, round: newRound },
            };
            dispatch({
              type: "REPLACE_NODE",
              payload: { tempId: dst.id, newNode: finalNode },
            });
            nodesRef.current = [
              ...nodesRef.current.filter((n) => n.id !== dst.id),
              finalNode,
            ];
            await autoMatchConfigService.createEdge({
              league_id: activeLeagueId,
              league_category_id: src.id,
              source: src.id,
              target: finalNode.id,
              sourceHandle,
              targetHandle,
            });
          }
        } else if (
          src.type === "roundFormat" &&
          dst.type === "leagueCategoryRound" &&
          src.data.type === "league_category_round_format" &&
          dst.data.type === "league_category_round" &&
          dst.data.round
        ) {
          if (src.data.format_obj?.round_id) {
            toast.error("This format is already attached to a round.");
            dispatch({
              type: "ON_EDGES_CHANGE",
              payload: [{ id: tempEdgeId, type: "remove" }],
            });
            return;
          }

          const existingFormat = nodesRef.current.find(
            (n) =>
              n.type === "roundFormat" &&
              n.data.type === "league_category_round_format" &&
              n.data.format_obj?.round_id === dst.id
          );

          if (existingFormat) {
            toast.error("This round already has a format.");
            dispatch({
              type: "ON_EDGES_CHANGE",
              payload: [{ id: tempEdgeId, type: "remove" }],
            });
            return;
          }

          let formatId = src.id;

          if (!isPermanentId(src.id)) {
            const newFormat = await autoMatchConfigService.createOrAttachFormat(
              {
                format_name: src.data.format_name,
                format_type: src.data.format_type,
                round_id: dst.id,
                position: src.position!,
              }
            );

            const finalFmt: AutomaticMatchConfigFlowNode = {
              ...src,
              id: newFormat.format_id,
              data: { ...src.data, format_obj: newFormat },
            };

            dispatch({
              type: "REPLACE_NODE",
              payload: { tempId: src.id, newNode: finalFmt },
            });

            nodesRef.current = [
              ...nodesRef.current.filter((n) => n.id !== src.id),
              finalFmt,
            ];

            formatId = newFormat.format_id;
          }

          await autoMatchConfigService.createEdge({
            league_id: activeLeagueId,
            league_category_id: dst.data.round.league_category_id!,
            source: formatId,
            target: dst.id,
            sourceHandle,
            targetHandle,
          });
        } else if (
          src.type === "leagueCategoryRound" &&
          dst.type === "leagueCategoryRound" &&
          src.data.type === "league_category_round" &&
          dst.data.type === "league_category_round"
        ) {
          const srcOrder = src.data.round.round_order ?? 0;
          const dstOrder = dst.data.round.round_order ?? 0;

          if (dstOrder <= srcOrder) {
            toast.error("Invalid: Cannot connect to a previous or same round.");
            dispatch({
              type: "ON_EDGES_CHANGE",
              payload: [{ id: tempEdgeId, type: "remove" }],
            });
            return;
          }

          if (
            !(dstOrder === srcOrder + 1 || (srcOrder === 0 && dstOrder === 2))
          ) {
            toast.error(
              "Invalid: Rounds must follow order (0→1→2→3) or skip 1."
            );
            dispatch({
              type: "ON_EDGES_CHANGE",
              payload: [{ id: tempEdgeId, type: "remove" }],
            });
            return;
          }
          let targetRoundId = dst.id;

          if (!isPermanentId(dst.id)) {
            const newRound = await autoMatchConfigService.createRound({
              league_category_id: src.data.round?.league_category_id!,
              round_name: dst.data.league_category_round,
              round_order: dst.data.round?.round_order ?? 0,
              position: dst.position!,
            });

            const finalNode: AutomaticMatchConfigFlowNode = {
              ...dst,
              id: newRound.round_id,
              data: { ...dst.data, round: newRound },
            };

            dispatch({
              type: "REPLACE_NODE",
              payload: { tempId: dst.id, newNode: finalNode },
            });

            nodesRef.current = [
              ...nodesRef.current.filter((n) => n.id !== dst.id),
              finalNode,
            ];

            targetRoundId = newRound.round_id;
          }

          await autoMatchConfigService.createEdge({
            league_id: activeLeagueId,
            league_category_id:
              src.data.round?.league_category_id ??
              dst.data.round?.league_category_id,
            source: src.id,
            target: targetRoundId,
            sourceHandle,
            targetHandle,
          });
        }
      } catch (err) {
        toast.error("Failed to save connection.");
        dispatch({
          type: "ON_EDGES_CHANGE",
          payload: [{ id: tempEdgeId, type: "remove" }],
        });
      }
    },
    [activeLeagueId, dispatch]
  );

  return {
    nodes,
    edges,
    onNodeDragStop,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    onDragOver,
  };
}
