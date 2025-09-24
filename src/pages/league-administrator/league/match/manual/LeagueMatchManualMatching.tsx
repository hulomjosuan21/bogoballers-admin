import { useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type {
  ILeagueCategory,
  ILeagueMatch,
  ILeagueCategoryRound,
} from "@/types/manual";
import ManualLeagueCategoryNode from "@/components/manual/ManualLeagueCategoryNode";
import ManualLeagueCategoryRoundNode from "@/components/manual/ManualLeagueCategoryRoundNode";
import ManualLeagueMatchNode from "@/components/manual/ManualLeagueMatchNode";
import { ManualFlowProvider, useFlow } from "@/context/ManualFlowContext";
import ManualLeagueTeamNodeMenu from "@/components/manual/ManualLeagueTeamNodeMenu";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ContentHeader from "@/components/content-header";

const FlowCanvas = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes } =
    useFlow();

  const nodeTypes = useMemo(
    () => ({
      leagueCategory: ManualLeagueCategoryNode,
      leagueCategoryRound: ManualLeagueCategoryRoundNode,
      leagueMatch: ManualLeagueMatchNode,
    }),
    []
  );

  useEffect(() => {
    const fetchedCategories: ILeagueCategory[] = [];
    const fetchedRounds: ILeagueCategoryRound[] = [];
    const fetchedMatches: ILeagueMatch[] = [];

    const categoryNodes = fetchedCategories.map((category) => ({
      id: category.league_category_id,
      type: "leagueCategory",
      position: category.position,
      data: { category: category },
    }));
    const roundNodes = fetchedRounds.map((round) => ({
      id: round.round_id,
      type: "leagueCategoryRound",
      position: round.position_two,
      data: { round: round }, // <-- Wrapping the data
    }));
    const matchNodes = fetchedMatches.map((match) => ({
      id: match.league_match_id,
      type: "leagueMatch",
      position: match.position,
      data: { match: match },
    }));

    setNodes([...categoryNodes, ...roundNodes, ...matchNodes]);
  }, [setNodes]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

const ManualFlow = () => {
  return (
    <div className="w-full h-full">
      <ReactFlowProvider>
        <ManualLeagueTeamNodeMenu />
        <FlowCanvas />
      </ReactFlowProvider>
    </div>
  );
};

export default function ManualMatchingPage() {
  return (
    <ContentShell>
      <ContentHeader title="Manual Matching Management" />
      <ContentBody>
        <ManualFlowProvider>
          <ManualFlow />
        </ManualFlowProvider>
      </ContentBody>
    </ContentShell>
  );
}
