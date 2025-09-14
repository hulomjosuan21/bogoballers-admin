import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Armchair, MoreVertical } from "lucide-react";
import type { PlayerBook } from "@/types/scorebook";

export const mockPlayersData: PlayerBook[] = [];

type PlayerOnTheFloorTableProps = {
  viewMode?: boolean;
  players: PlayerBook[];
};

type PlayerRosterProps = {
  viewMode?: boolean;
};

function PlayerChip({ player }: { player: PlayerBook }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: player.player_id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 10,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 text-xs border rounded-sm p-2 bg-card cursor-grab ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <span className="text-xs">{player.jersey_name}</span>
      <span className="text-sm">{player.jersey_number}</span>
    </div>
  );
}

function DroppableTableRow({
  player,
  children,
}: {
  player: PlayerBook;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: player.player_id,
  });

  return (
    <TableRow ref={setNodeRef} className={`${isOver ? "bg-primary/10" : ""}`}>
      {children}
    </TableRow>
  );
}

export function PlayerOnTheFloorTable({
  viewMode = false,
  players,
}: PlayerOnTheFloorTableProps) {
  const columns: ColumnDef<PlayerBook>[] = [
    {
      accessorKey: "player",
      header: "Player",
      cell: ({ row }) => {
        const player = row.original;
        return (
          <div className="flex flex-col items-start gap-1">
            <span className="text-sm font-medium">{player.full_name}</span>
            <span className="text-xs text-muted-foreground">
              {player.jersey_number} | {player.jersey_name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "score",
      header: "Score",
      cell: ({ row }) => {
        const player = row.original;
        return (
          <div className="flex-[0_0_auto] w-fit flex gap-1 items-center flex-nowrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size={"sm"}
                  variant={"dim"}
                  className="h-6 px-1 rounded-sm"
                  disabled={viewMode}
                >
                  <MoreVertical className="h-3 w-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel className="text-xs py-0">
                  Controls
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="group-sm">
                  <DropdownMenuItem className="menu-sm-d">
                    -fg2
                  </DropdownMenuItem>
                  <DropdownMenuItem className="menu-sm">+fg2</DropdownMenuItem> 
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="group-sm">
                  <DropdownMenuItem className="menu-sm-d">
                    -fga2
                  </DropdownMenuItem>
                  <DropdownMenuItem className="menu-sm">+fga2</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="group-sm">
                  <DropdownMenuItem className="menu-sm-d">
                    -fg3
                  </DropdownMenuItem>
                  <DropdownMenuItem className="menu-sm">+fg3</DropdownMenuItem> 
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="group-sm">
                  <DropdownMenuItem className="menu-sm-d">
                    -fga3
                  </DropdownMenuItem>
                  <DropdownMenuItem className="menu-sm">+fga3</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="group-sm">
                  <DropdownMenuItem className="menu-sm-d">-ft</DropdownMenuItem>
                  <DropdownMenuItem className="menu-sm">+fta</DropdownMenuItem> 
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="grid grid-cols-3 gap-1">
                  <DropdownMenuItem className="menu-sm-d">-1</DropdownMenuItem> 
                  <DropdownMenuItem className="menu-sm-d">+2</DropdownMenuItem> 
                  <DropdownMenuItem className="menu-sm-d">-3</DropdownMenuItem> 
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Input
              type="number"
              defaultValue={player.total_score}
              className="rounded-sm w-12 remove-spinner"
              variant={"sm"}
              readOnly={viewMode}
            />
            <Button
              size={"sm"}
              variant={"dashed"}
              className="h-6 px-1 rounded-sm"
              disabled={viewMode}
            >
              +1
            </Button>
            <Button
              size={"sm"}
              variant={"secondary"}
              className="h-6 px-1 rounded-sm"
              disabled={viewMode}
            >
              +2
            </Button>
            <Button
              size={"sm"}
              className="h-6 px-1 rounded-sm"
              disabled={viewMode}
            >
              +3
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "P",
      header: "Pn",
      cell: ({ row }) => (
        <Input
          type="number"
          defaultValue={row.original.P}
          className="rounded-sm w-12 remove-spinner"
          variant={"sm"}
          readOnly={viewMode}
        />
      ),
    },
    {
      accessorKey: "T",
      header: "Tn",
      cell: ({ row }) => (
        <Input
          type="number"
          defaultValue={row.original.T}
          className="rounded-sm w-12 remove-spinner"
          variant={"sm"}
          readOnly={viewMode}
        />
      ),
    },
  ];

  const table = useReactTable({
    data: players,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted text-xs p-0">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="py-0 h-8">
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
          {rows.length ? (
            rows.map((row) => (
              <DroppableTableRow key={row.id} player={row.original}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-1">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </DroppableTableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No players on the floor.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function PlayerRoster({ viewMode = false }: PlayerRosterProps) {
  const [players, setPlayers] = useState<PlayerBook[]>(mockPlayersData);

  const playersOnFloor = players.filter((p) => !p.onBench);
  const playersOnBench = players.filter((p) => p.onBench);

  function handlePlayerSwap(
    draggedId: UniqueIdentifier,
    droppedId: UniqueIdentifier
  ) {
    if (draggedId === droppedId) return;

    setPlayers((currentPlayers) => {
      const draggedPlayerIndex = currentPlayers.findIndex(
        (p) => p.player_id === draggedId
      );
      const droppedPlayerIndex = currentPlayers.findIndex(
        (p) => p.player_id === droppedId
      );

      if (draggedPlayerIndex === -1 || droppedPlayerIndex === -1) {
        return currentPlayers;
      }

      const newPlayers = [...currentPlayers];

      newPlayers[draggedPlayerIndex] = {
        ...newPlayers[draggedPlayerIndex],
        onBench: false,
      };
      newPlayers[droppedPlayerIndex] = {
        ...newPlayers[droppedPlayerIndex],
        onBench: true,
      };

      return newPlayers;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (
      over &&
      playersOnBench.some((p) => p.player_id === active.id) &&
      playersOnFloor.some((p) => p.player_id === over.id)
    ) {
      handlePlayerSwap(active.id, over.id);
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="space-y-2">
        <PlayerOnTheFloorTable viewMode={viewMode} players={playersOnFloor} />
        <div className="p-2 border rounded-md">
          <div className="pb-2 flex items-center gap-2">
            <span className="font-semibold text-sm">Bench</span>
            <Armchair className="h-4 w-4" />
          </div>

          {playersOnBench.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {playersOnBench.map((player) => (
                <PlayerChip key={player.player_id} player={player} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No players on the bench.
            </p>
          )}
        </div>
      </div>
    </DndContext>
  );
}
