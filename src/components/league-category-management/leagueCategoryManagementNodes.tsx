import {
  Handle,
  Position,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import {
  getRoundTypeByOrder,
  type CategoryNodeData,
  type FormatNodeData,
  type RoundNodeData,
} from "@/types/leagueCategoryTypes";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { RoundNodeSheet } from "@/components/league-category-management/LeagueCategoryManagementComponents";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function CategoryNode({ data }: { data: CategoryNodeData }) {
  const { category, metadata } = data;

  return (
    <div className="border-2 rounded-md flex flex-col overflow-hidden w-[1280px] h-[720px]">
      <div className="bg-primary/50 text-sm py-1 px-4 flex justify-between items-center gap-2">
        <p>
          <strong className="">Category:</strong> {category.category_name}
        </p>
      </div>
      <div className="flex-1 p-2 overflow-auto flex flex-col">
        <p className="text-helper italic text-xs mb-4">
          Drop round & format nodes here...
        </p>
        <div className="flex-grow" />
        <div className="text-helper flex items-center">
          <p className="px-2 border-r">Max Teams: {category.max_team}</p>
          <p className="px-2 border-r">
            Team Entrance Fee: {category.team_entrance_fee_amount}
          </p>
          <p className="px-2 border-r">
            Allow guest player: {category.allow_guest_player ? "Yes" : "No"}
          </p>
          <p className="px-2 border-r">
            Allowed Address: {category.allowed_address}
          </p>
          <p className="px-2">
            Remaining teams count: {metadata.eligible_teams_count}
          </p>
        </div>
      </div>
    </div>
  );
}

type NodesRef = React.RefObject<Node<any>[]>;

function RoundName({ order }: { order: number }) {
  return <span className="font-medium">{getRoundTypeByOrder(order)}</span>;
}

function getStatusClasses(status: string) {
  switch (status) {
    case "Upcoming":
      return "bg-blue-500/15 text-blue-600";
    case "Ongoing":
      return "bg-yellow-500/15 text-yellow-600";
    case "Finished":
      return "bg-green-500/15 text-green-600";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function RoundNode({
  data,
  allNodesRef,
}: {
  data: RoundNodeData;
  allNodesRef: NodesRef;
}) {
  const allNodes = allNodesRef.current ?? [];
  const order = data.round.round_order;

  const isTarget = allNodes.some(
    (n) => (n.data as any)?.round?.next_round_id === data.round.round_id
  );
  const hasLeft = order > 0 || isTarget;
  const hasRight = order < 3;

  return (
    <div className="flex flex-col items-center">
      <div className="mb-1">
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${getStatusClasses(
            data.round.round_status
          )}`}
        >
          {data.round.round_status}
        </span>
      </div>

      <div className="rounded-md p-3 flex items-center justify-between gap-2 border-2 group bg-background">
        <RoundName order={order} />
        <RoundNodeSheet data={data} disable={data.viewOnly} />

        {hasLeft && (
          <Handle
            id="left"
            type="target"
            position={Position.Left}
            isValidConnection={(conn: Connection | Edge) => {
              const sourceNode = allNodes.find((n) => n.id === conn.source);
              const srcOrder = (sourceNode?.data as any)?.round?.round_order;
              if (typeof srcOrder !== "number") return false;

              if (order === 1) return srcOrder === 0;
              if (order === 2) return srcOrder === 1 || srcOrder === 0;
              if (order === 3) return srcOrder === 2;
              return false;
            }}
          />
        )}

        {hasRight && (
          <Handle
            id="right"
            type="source"
            position={Position.Right}
            isValidConnection={(conn: Connection | Edge) => {
              const targetNode = allNodes.find((n) => n.id === conn.target);
              const tgtOrder = (targetNode?.data as any)?.round?.round_order;
              if (typeof tgtOrder !== "number") return false;

              if (order === 0 && tgtOrder === 1) return true;
              if (order === 0 && tgtOrder === 2) return true;
              if (order === 1 && tgtOrder === 2) return true;
              if (order === 2 && tgtOrder === 3) return true;
              return false;
            }}
          />
        )}

        <Handle
          id="bottom"
          type="source"
          position={Position.Bottom}
          isValidConnection={(conn: Connection | Edge) => {
            const targetNode = allNodes.find((n) => n.id === conn.target);
            return (
              conn.targetHandle === "top" && targetNode?.type === "formatNode"
            );
          }}
        />
      </div>
    </div>
  );
}

export function FormatNode({ data }: { data: FormatNodeData }) {
  const { getEdges } = useReactFlow();
  const { round } = data;
  const errorShownRef = useRef(false);

  const [advantagedTeam, setAdvantagedTeam] = useState<string | null>(null);
  const [challengerTeam, setChallengerTeam] = useState<string | null>(null);

  const leagueTeams: { league_team_id: string; team_name: string }[] = [];

  const validateConnection = (conn: Connection | Edge) => {
    const edges = getEdges();
    const alreadyConnected = edges.some(
      (edge) =>
        edge.target === conn.target && edge.targetHandle === conn.targetHandle
    );

    if (alreadyConnected) {
      if (!errorShownRef.current) {
        toast.error("This format is already connected!");
        errorShownRef.current = true;
      }
      return false;
    }

    return conn.sourceHandle === "bottom";
  };

  const isFinalOrSemifinal =
    round?.round_name?.toLowerCase() === "final" ||
    round?.round_name?.toLowerCase() === "semifinal";

  const updateSeriesConfig = (
    key: "advantaged_team" | "challenger_team",
    value: string
  ) => {
    if (!data.round_format?.format_config) return;

    if (!data.round_format.format_config.series_config) {
      data.round_format.format_config.series_config = {
        type: "TwiceToBeat",
        advantaged_team: null,
        challenger_team: null,
        max_games: 2,
      };
    }

    data.round_format.format_config.series_config[key] = value;
  };

  const handleSave = async () => {
    if (!advantagedTeam || !challengerTeam) {
      toast.error("Please select both teams before saving");
      return;
    }

    updateSeriesConfig("advantaged_team", advantagedTeam);
    updateSeriesConfig("challenger_team", challengerTeam);

    // 🔥 Call API here if needed
    // await api.updateSeriesConfig({
    //   round_id: round.round_id,
    //   advantaged_team: advantagedTeam,
    //   challenger_team: challengerTeam,
    //   type: "TwiceToBeat",
    //   max_games: 2,
    // });

    toast.success("Twice-to-Beat setup saved!");
  };

  return (
    <div
      className="rounded-md p-2 flex flex-col gap-1 border-2 bg-background"
      onMouseUp={() => {
        errorShownRef.current = false;
      }}
    >
      <span className="text-xs font-semibold">
        Format: {data.round_format?.format_config?.label ?? data.label}
      </span>

      {isFinalOrSemifinal && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Configure {round.round_name}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Twice-to-Beat Setup</DialogTitle>
              <DialogDescription>
                Select the advantaged and challenger teams for the{" "}
                {round.round_name}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Advantaged */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="advantaged">Advantaged</Label>
                <Select
                  value={advantagedTeam ?? ""}
                  onValueChange={(value) => {
                    setAdvantagedTeam(value);
                    updateSeriesConfig("advantaged_team", value);
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {leagueTeams
                      .filter((t) => t.league_team_id !== challengerTeam)
                      .map((t) => (
                        <SelectItem
                          key={t.league_team_id}
                          value={t.league_team_id}
                        >
                          {t.team_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Challenger */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="challenger">Challenger</Label>
                <Select
                  value={challengerTeam ?? ""}
                  onValueChange={(value) => {
                    setChallengerTeam(value);
                    updateSeriesConfig("challenger_team", value);
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {leagueTeams
                      .filter((t) => t.league_team_id !== advantagedTeam)
                      .map((t) => (
                        <SelectItem
                          key={t.league_team_id}
                          value={t.league_team_id}
                        >
                          {t.team_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleSave}>Save Setup</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {data._isNew ? (
        <span className="text-xs text-primary font-medium">
          (New - unsaved)
        </span>
      ) : null}

      <Handle
        id="top"
        type="target"
        position={Position.Top}
        isValidConnection={validateConnection}
      />
    </div>
  );
}
