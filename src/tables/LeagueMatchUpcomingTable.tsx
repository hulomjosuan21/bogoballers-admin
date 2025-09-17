import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useLeagueMatch } from "@/hooks/leagueMatch";
import type { LeagueMatch } from "@/types/leagueMatch";
import { GripVertical, X } from "lucide-react";
import { formatDate12h } from "@/lib/app_utils";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

type Props = {
  leagueCategoryId?: string;
  roundId?: string;
  fromApi?: LeagueMatch | null;
};

function DraggableRow({
  match,
  children,
}: {
  match: LeagueMatch;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: match.public_league_match_id,
      data: { match },
    });

  return (
    <TableRow
      ref={setNodeRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      }}
      {...listeners}
      {...attributes}
    >
      {children}
    </TableRow>
  );
}

function DropSlot({
  match,
  onRemove,
}: {
  match: LeagueMatch | null;
  onRemove: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: "drop-slot" });
  const navigate = useNavigate();

  const handleStart = () => {
    navigate(`/scorebook/${match?.league_match_id}`);
  };

  return (
    <div
      ref={setNodeRef}
      className={`mb-4 flex min-h-[100px] items-center justify-center rounded-md border-1 border-dashed p-4 transition ${
        isOver && "border-primary"
      }`}
    >
      {match ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <img
              src={match.home_team.team_logo_url}
              alt={match.home_team.team_name}
              className="h-8 w-8 rounded-sm object-cover"
            />
            <span className="font-medium">{match.home_team.team_name}</span>
            <span className="mx-2">vs</span>
            <img
              src={match.away_team.team_logo_url}
              alt={match.away_team.team_name}
              className="h-8 w-8 rounded-sm object-cover"
            />
            <span className="font-medium">{match.away_team.team_name}</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleStart}>
              Start
            </Button>
            <Button size="sm" variant="outline" onClick={onRemove}>
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <span className="text-muted">Drop a match here</span>
      )}
    </div>
  );
}

export function UpcomingMatchTable({
  leagueCategoryId,
  roundId,
  fromApi,
}: Props) {
  const { leagueMatchData, leagueMatchLoading, leagueMatchError } =
    useLeagueMatch(leagueCategoryId, roundId, {
      condition: "Upcoming",
    });

  const [matches, setMatches] = useState<LeagueMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<LeagueMatch | null>(
    fromApi ?? null
  );
  const [activeMatch, setActiveMatch] = useState<LeagueMatch | null>(null);

  useEffect(() => {
    if (leagueMatchData) {
      setMatches(
        leagueMatchData.filter(
          (m) => m.public_league_match_id !== fromApi?.public_league_match_id
        )
      );
    }
  }, [leagueMatchData, fromApi]);

  const columns: ColumnDef<LeagueMatch>[] = [
    {
      id: "drag",
      header: "",
      cell: () => {
        return (
          <div>
            <GripVertical size={16} />
          </div>
        );
      },
      size: 30,
    },
    {
      accessorKey: "home-team",
      header: "Home Team",
      cell: ({ row }) => {
        const { home_team } = row.original;
        return (
          <div className="flex items-center gap-2">
            <img
              src={home_team.team_logo_url}
              alt={home_team.team_name}
              className="h-8 w-8 rounded-sm object-cover"
            />
            <span>{home_team.team_name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "away-team",
      header: "Away Team",
      cell: ({ row }) => {
        const { away_team } = row.original;
        return (
          <div className="flex items-center gap-2">
            <img
              src={away_team.team_logo_url}
              alt={away_team.team_name}
              className="h-8 w-8 rounded-sm object-cover"
            />
            <span>{away_team.team_name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "scheduled_date",
      header: "Date",
      cell: ({ row }) => (
        <span>{formatDate12h(row.original.scheduled_date!)}</span>
      ),
    },
    {
      accessorKey: "details",
      header: "Format",
      cell: ({ row }) => {
        const { quarters, minutes_per_quarter } = row.original;
        return quarters && minutes_per_quarter ? (
          `${quarters}Q @ ${minutes_per_quarter}m`
        ) : (
          <Badge variant="outline" className="gap-1">
            <X className="text-red-500" size={12} aria-hidden="true" />
            Not Set
          </Badge>
        );
      },
    },
  ];

  const table = useReactTable({
    data: matches,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleDragStart = (event: any) => {
    if (event.active.data.current?.match) {
      setActiveMatch(event.active.data.current.match);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over?.id === "drop-slot" && event.active.data.current?.match) {
      const dropped = event.active.data.current.match as LeagueMatch;
      setSelectedMatch(dropped);
      setMatches((prev) =>
        prev.filter(
          (m) => m.public_league_match_id !== dropped.public_league_match_id
        )
      );
    }
    setActiveMatch(null);
  };

  const handleRemove = () => {
    if (selectedMatch) {
      setMatches((prev) => [...prev, selectedMatch]); // return to table
      setSelectedMatch(null);
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* Drop Slot */}
      <DropSlot match={selectedMatch} onRemove={handleRemove} />

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <DraggableRow key={row.id} match={row.original}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </DraggableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {leagueMatchLoading
                    ? "Loading data..."
                    : leagueMatchError
                    ? leagueMatchError.message
                    : "No upcoming matches"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {createPortal(
        <DragOverlay>
          {activeMatch ? (
            <div className="flex items-center gap-2 rounded-md border bg-background p-2 shadow-lg">
              <img
                src={activeMatch.home_team.team_logo_url}
                alt={activeMatch.home_team.team_name}
                className="h-6 w-6 rounded-sm object-cover"
              />
              <span>{activeMatch.home_team.team_name}</span>
              <span className="mx-1">vs</span>
              <img
                src={activeMatch.away_team.team_logo_url}
                alt={activeMatch.away_team.team_name}
                className="h-6 w-6 rounded-sm object-cover"
              />
              <span>{activeMatch.away_team.team_name}</span>
            </div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
