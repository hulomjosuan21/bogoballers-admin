import { Input, InputAddon, InputGroup } from "@/components/ui/input";
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
import type { PlayerBook, TeamBook } from "@/types/scorebook";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Props = {
  viewMode?: boolean;
};

export default function Scorebook({ viewMode = false }: Props) {
  return (
    <main className="grid p-1 grid-cols-1 md:grid-cols-2 gap-2">
      <TopSection viewMode={viewMode} />
      <TeamSection viewMode={viewMode} />
    </main>
  );
}

export function TopSection({ viewMode }: Props) {
  return (
    <div className="col-span-2 flex">
      <Select disabled={viewMode}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Quarters" />
        </SelectTrigger>
        <SelectContent>
          {/* <SelectItem value="1st-qtr">1st qtr</SelectItem> depends on how quarters */}
          {/* and the abilit of add overtime */}
        </SelectContent>
      </Select>
      {/* do the timer control here also */}
      {/* and other */}
      {/* like total team score */}
    </div>
  );
}

function TeamSection({ viewMode }: Props) {
  return (
    <section className="grid auto-rows-auto gap-1">
      <PlayerRoster viewMode={viewMode} />
      <div className="flex items-center justify-start gap-2">
        <InputGroup>
          <InputAddon variant={"sm"}>Coach Tn</InputAddon>
          <Input type="number" variant={"sm"} />
        </InputGroup>
        <InputGroup>
          <InputAddon variant={"sm"}>None Member Tn</InputAddon>
          <Input type="number" variant={"sm"} />
        </InputGroup>
      </div>
      <TeamDataPerQtrTable viewMode={viewMode} />
      <div className="flex items-center justify-start gap-2">
        <InputGroup>
          <InputAddon variant={"sm"}>Cap't ball</InputAddon>
          <Input variant={"sm"} />
        </InputGroup>
        <InputGroup>
          <InputAddon variant={"sm"}>Turnovers</InputAddon>
          <Input variant={"sm"} />
        </InputGroup>
        <InputGroup>
          <InputAddon variant={"sm"}>FG%</InputAddon>
          <Input variant={"sm"} />
        </InputGroup>
        <InputGroup>
          <InputAddon variant={"sm"}>FG%</InputAddon>
          <Input variant={"sm"} readOnly />
        </InputGroup>
      </div>
      <TeamTimeOutControl viewMode={viewMode} />
    </section>
  );
}

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
  viewMode,
}: Props & { players: PlayerBook[] }) {
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
                <DropdownMenuGroup className="group-sm">
                  <DropdownMenuItem className="menu-sm-d">
                    -reb
                  </DropdownMenuItem>
                  <DropdownMenuItem className="menu-sm">+reb</DropdownMenuItem> 
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="group-sm">
                  <DropdownMenuItem className="menu-sm-d">
                    -ast
                  </DropdownMenuItem>
                  <DropdownMenuItem className="menu-sm">+ast</DropdownMenuItem> 
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="group-sm">
                  <DropdownMenuItem className="menu-sm-d">
                    -stl
                  </DropdownMenuItem>
                  <DropdownMenuItem className="menu-sm">+stl</DropdownMenuItem> 
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="group-sm">
                  <DropdownMenuItem className="menu-sm-d">
                    -blk
                  </DropdownMenuItem>
                  <DropdownMenuItem className="menu-sm">+blk</DropdownMenuItem> 
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="group-sm">
                  <DropdownMenuItem className="menu-sm-d">
                    -tov
                  </DropdownMenuItem>
                  <DropdownMenuItem className="menu-sm">+tov</DropdownMenuItem> 
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
    data: [],
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

export function PlayerRoster({ viewMode }: Props) {
  const [players, setPlayers] = useState<PlayerBook[]>([]);

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

function TeamDataPerQtrTable({ viewMode }: Props) {
  const columns: ColumnDef<TeamBook>[] = [
    {
      accessorKey: "qtr",
      header: "qtr",
    },
    {
      accessorKey: "team-foul",
      header: "Team foul",
      cell: ({ row }) => (
        <Input
          type="number"
          className="rounded-sm w-12 remove-spinner"
          variant={"sm"}
          readOnly={viewMode}
        />
      ),
    },
    {
      accessorKey: "score-per-qtr",
      header: "Score",
      cell: ({ row }) => <span>0</span>,
    },
  ];

  const table = useReactTable({
    data: [],
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function TeamTimeOutControl({ viewMode }: Props) {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableBody>
          <TableRow className="">
            <TableCell className="">1</TableCell>
            <Input
              className="rounded-sm w-12 "
              variant={"sm"}
              readOnly={viewMode}
            />
          </TableRow>
          <TableRow className="">
            <TableCell className="">2</TableCell>
            <Input
              className="rounded-sm w-12"
              variant={"sm"}
              readOnly={viewMode}
            />
          </TableRow>
          <TableRow className="">
            <TableCell className="">3</TableCell>
            <Input
              className="rounded-sm w-12"
              variant={"sm"}
              readOnly={viewMode}
            />
          </TableRow>
          <TableRow className="">
            <TableCell className="">4</TableCell>
            <TableCell className="">
              <Input
                className="rounded-sm w-12"
                variant={"sm"}
                readOnly={viewMode}
              />
            </TableCell>
          </TableRow>
          <TableRow className="">
            <TableCell className="">5</TableCell>
            <TableCell className="">
              <Input
                className="rounded-sm w-12"
                variant={"sm"}
                readOnly={viewMode}
              />
            </TableCell>
          </TableRow>
          <TableRow className="">
            <TableCell className="">6</TableCell>
            <TableCell className="">
              <Input
                className="rounded-sm w-12"
                variant={"sm"}
                readOnly={viewMode}
              />
            </TableCell>
          </TableRow>
          <TableRow className="">
            <TableCell className="">20</TableCell>
            <TableCell className="">
              <Input
                className="rounded-sm w-12"
                variant={"sm"}
                readOnly={viewMode}
              />
            </TableCell>
          </TableRow>
          <TableRow className="">
            <TableCell className="">20</TableCell>
            <TableCell className="">
              <Input
                className="rounded-sm w-12 remove-spinner"
                variant={"sm"}
                readOnly={viewMode}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

// add table for display summary of 15 players for each team
