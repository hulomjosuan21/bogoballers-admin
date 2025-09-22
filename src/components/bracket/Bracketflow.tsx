import {
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";

export type MatchNodeData = {
  league_match_id: string;
  home_team_name: string | null;
  away_team_name: string | null;
  home_score: number | null;
  away_score: number | null;
  depends_on_match_ids: string[];
  round_number: number | null;
  bracket_side: string | null;
};

function MatchNode({
  data,
}: {
  data: { home: string; away: string; score: string };
}) {
  return (
    <div className="border rounded-md p-2 w-56 text-sm relative">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !-left-1"
      />

      <div className="font-bold text-center mb-1">{data.score}</div>
      <div className="flex justify-between gap-4">
        <span className="">{data.home}</span>
        <span className="">{data.away}</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !-right-1"
      />
    </div>
  );
}

function generateNodes(matches: MatchNodeData[]): Node[] {
  const xSpacing = 300;
  const ySpacing = 100;
  const grouped = new Map<string, MatchNodeData[]>();

  for (const match of matches) {
    const key = `${match.bracket_side ?? "main"}-${match.round_number ?? 0}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(match);
  }

  const nodes: Node[] = [];
  let x = 0;

  for (const [, group] of Array.from(grouped.entries()).sort()) {
    group.forEach((match, i) => {
      nodes.push({
        id: match.league_match_id,
        type: "matchNode",
        position: { x, y: i * ySpacing },
        data: {
          home: match.home_team_name ?? "TBD",
          away: match.away_team_name ?? "TBD",
          score:
            match.home_score !== null && match.away_score !== null
              ? `${match.home_score} - ${match.away_score}`
              : "—",
        },
      });
    });
    x += xSpacing;
  }

  return nodes;
}

function generateEdges(matches: MatchNodeData[]): Edge[] {
  const edges: Edge[] = [];

  for (const match of matches) {
    for (const sourceId of match.depends_on_match_ids) {
      edges.push({
        id: `${sourceId}->${match.league_match_id}`,
        source: sourceId,
        target: match.league_match_id,
        animated: false,
        style: {
          stroke: match.bracket_side === "losers" ? "#dc2626" : "#2563eb",
          strokeWidth: 2,
        },
      });
    }
  }

  return edges;
}

export function BracketFlow({ matches }: { matches: MatchNodeData[] }) {
  const nodes = generateNodes(matches);
  const edges = generateEdges(matches);

  return (
    <div className="h-[600px] w-full border rounded">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={{ matchNode: MatchNode }}
        fitView
        panOnDrag
        zoomOnScroll
      />
    </div>
  );
}
