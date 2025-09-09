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
  RoundFormatTypesEnum,
  type CategoryNodeData,
  type FormatNodeData,
  type RoundNodeData,
} from "@/types/leagueCategoryTypes";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  LeagueCategoryNodeSheet,
  RoundNodeSheet,
} from "@/components/league-category-management/LeagueCategoryManagementComponents";
import { Button } from "../ui/button";
import { Settings2 } from "lucide-react";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { LeagueCategoryRoundService } from "@/service/leagueCategoryManagementService";

export function CategoryNode({ data }: { data: CategoryNodeData }) {
  const { category, viewOnly } = data;

  return (
    <div className="border-2 rounded-md flex flex-col overflow-hidden w-[1280px] h-[720px]">
      <div className="bg-primary text-sm py-1 px-4 flex justify-between items-center gap-2">
        <p>
          <strong>Category:</strong> {category.category_name}
        </p>
        <LeagueCategoryNodeSheet data={data} disable={viewOnly} />
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
          <p className="px-2">Allowed Address: {category.allowed_address}</p>
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
  const errorShownRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, any>>(
    data.format_config ?? {}
  );

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

  return (
    <div
      className="rounded-md p-2 flex flex-col gap-1 border-2 bg-background"
      onMouseUp={() => {
        errorShownRef.current = false;
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold">Format: {data.label}</span>
        {!data._isNew && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="format-settings"
              >
                <Settings2 className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <FormatConfigForm
                formatType={data.label as RoundFormatTypesEnum}
                roundId={data.round_id}
                values={values}
                setValues={setValues}
                onSuccess={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {Object.keys(values).length > 0 && (
        <div className="text-xs text-muted-foreground flex flex-col gap-1 mt-1">
          {Object.entries(values).map(([key, value]) => (
            <div key={key}>
              <span className="font-medium">{key.replaceAll("_", " ")}:</span>{" "}
              <span>
                {Array.isArray(value) ? value.join(", ") : String(value)}
              </span>
            </div>
          ))}
        </div>
      )}

      {data._isNew && Object.keys(values).length === 0 && (
        <span className="text-xs text-primary font-medium">
          (New - unsaved)
        </span>
      )}

      <Handle
        id="top"
        type="target"
        position={Position.Top}
        isValidConnection={validateConnection}
      />
    </div>
  );
}

export function FormatConfigForm({
  formatType,
  roundId,
  values,
  setValues,
  onSuccess,
}: {
  formatType: RoundFormatTypesEnum;
  roundId?: string;
  values: Record<string, any>;
  setValues: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  onSuccess?: () => void;
}) {
  const handleInputChange = (key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const [isPending, startTransition] = useTransition();

  const handleChange = () => {
    startTransition(() => {
      const promise = LeagueCategoryRoundService.updateRound({
        roundId: roundId!,
        changes: { format_config: values },
      });

      toast.promise(promise, {
        loading: "Configuring format...",
        success: (data) => {
          onSuccess?.();
          return data.message;
        },
        error: "Failed to config format",
      });
    });
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      {formatType === RoundFormatTypesEnum.RoundRobin && (
        <>
          <Input
            placeholder="Groups"
            type="number"
            value={values.groups ?? ""}
            onChange={(e) =>
              handleInputChange("groups", Number(e.target.value))
            }
          />
          <Input
            placeholder="Games per Team"
            type="number"
            value={values.games_per_team ?? ""}
            onChange={(e) =>
              handleInputChange("games_per_team", Number(e.target.value))
            }
          />
          <Input
            placeholder="Advances per Group"
            type="number"
            value={values.advances_per_group ?? ""}
            onChange={(e) =>
              handleInputChange("advances_per_group", Number(e.target.value))
            }
          />
        </>
      )}

      {formatType === RoundFormatTypesEnum.Knockout && (
        <>
          <Input
            placeholder="Seeding (random/ranking)"
            onChange={(e) => handleInputChange("seeding", e.target.value)}
          />
          <Input
            placeholder="Advances"
            type="number"
            value={values.advances ?? ""}
            onChange={(e) =>
              handleInputChange("advances", Number(e.target.value))
            }
          />
          <Input
            placeholder="Single Elimination (true/false)"
            value={values.single_elim ?? ""}
            onChange={(e) =>
              handleInputChange("single_elim", e.target.value === "true")
            }
          />
        </>
      )}

      {formatType === RoundFormatTypesEnum.BestOf && (
        <>
          <Input
            placeholder="Number of Games (e.g. 3, 5, 7)"
            type="number"
            value={values.games ?? ""}
            onChange={(e) => handleInputChange("games", Number(e.target.value))}
          />
          <Input
            placeholder="Advances"
            type="number"
            value={values.advances ?? ""}
            onChange={(e) =>
              handleInputChange("advances", Number(e.target.value))
            }
          />
        </>
      )}

      {formatType === RoundFormatTypesEnum.DoubleElimination && (
        <>
          <Input
            placeholder="Max Loss"
            type="number"
            value={values.max_loss ?? ""}
            onChange={(e) =>
              handleInputChange("max_loss", Number(e.target.value))
            }
          />
          <Input
            placeholder="Advances"
            type="number"
            value={values.advances ?? ""}
            onChange={(e) =>
              handleInputChange("advances", Number(e.target.value))
            }
          />
          <Input
            placeholder="Brackets (comma-separated)"
            value={values.brackets?.join(", ") ?? ""}
            onChange={(e) =>
              handleInputChange(
                "brackets",
                e.target.value.split(",").map((b) => b.trim())
              )
            }
          />
        </>
      )}

      {formatType === RoundFormatTypesEnum.TwiceToBeat && (
        <>
          <Input
            placeholder="Advantaged Team ID"
            onChange={(e) =>
              handleInputChange("advantaged_team", e.target.value)
            }
          />
          <Input
            placeholder="Challenger Team ID"
            onChange={(e) =>
              handleInputChange("challenger_team", e.target.value)
            }
          />
        </>
      )}

      <Button disabled={isPending} onClick={handleChange}>
        Config
      </Button>
    </div>
  );
}
