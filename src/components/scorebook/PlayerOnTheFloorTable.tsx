import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import type { PlayerBook, PlayerStatsSummary } from "@/types/scorebook";
import { DroppableTableRow } from "./DroppableTableRow";
import { memo } from "react";
import type { Action } from "@/context/GameContext";

type Props = {
  viewMode?: boolean;
  players: PlayerBook[];
  dispatch: React.Dispatch<Action>;
};

export const PlayerOnTheFloorTable = memo(function PlayerOnTheFloorTable({
  viewMode,
  players,
  dispatch,
}: Props) {
  const columns: ColumnDef<PlayerBook>[] = [
    {
      accessorKey: "player",
      header: "Player",
      cell: ({ row }) => {
        const player = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium whitespace-nowrap">
              {player.jersey_name}
            </span>
            <span className="text-xs text-muted-foreground">
              #{player.jersey_number}
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
        const updateStat = (
          stat: keyof PlayerStatsSummary | "P" | "T",
          value: number
        ) => {
          dispatch({
            type: "UPDATE_PLAYER_STAT",
            payload: {
              teamId: player.player_team_id,
              playerId: player.player_id,
              stat,
              value,
            },
          });
        };
        return (
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-1"
                  disabled={viewMode}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Scoring</DropdownMenuLabel>
                <DropdownMenuGroup className="group-sm">
                  <DropdownMenuItem
                    className="menu-sm"
                    onSelect={() => updateStat("fg2m", 1)}
                  >
                    +2 Made
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="menu-sm-d"
                    onSelect={() => updateStat("fg2a", 1)}
                  >
                    +2 Miss
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="menu-sm"
                    onSelect={() => updateStat("fg3m", 1)}
                  >
                    +3 Made
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="menu-sm-d"
                    onSelect={() => updateStat("fg3a", 1)}
                  >
                    +3 Miss
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="menu-sm"
                    onSelect={() => updateStat("ftm", 1)}
                  >
                    +1 Made
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="menu-sm-d"
                    onSelect={() => updateStat("fta", 1)}
                  >
                    +1 Miss
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Stats</DropdownMenuLabel>
                <DropdownMenuGroup className="group-sm">
                  <DropdownMenuItem
                    className="menu-sm"
                    onSelect={() => updateStat("reb", 1)}
                  >
                    +REB
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="menu-sm"
                    onSelect={() => updateStat("ast", 1)}
                  >
                    +AST
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="menu-sm"
                    onSelect={() => updateStat("stl", 1)}
                  >
                    +STL
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="menu-sm"
                    onSelect={() => updateStat("blk", 1)}
                  >
                    +BLK
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="menu-sm"
                    onSelect={() => updateStat("tov", 1)}
                  >
                    +TOV
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Fouls</DropdownMenuLabel>
                <DropdownMenuGroup className="group-sm">
                  <DropdownMenuItem
                    className="menu-sm"
                    onSelect={() => updateStat("P", 1)}
                  >
                    +PF
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="menu-sm"
                    onSelect={() => updateStat("T", 1)}
                  >
                    +TF
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Input
              id={`score-input-${player.player_team_id}-${player.player_id}`}
              type="number"
              value={player.total_score}
              readOnly
              className="w-12 h-7 text-center font-bold"
            />
            <Button
              size="sm"
              className="h-7 px-2"
              onClick={() => updateStat("ftm", 1)}
              disabled={viewMode}
            >
              +1
            </Button>
            <Button
              size="sm"
              className="h-7 px-2"
              onClick={() => updateStat("fg2m", 1)}
              disabled={viewMode}
            >
              +2
            </Button>
            <Button
              size="sm"
              className="h-7 px-2"
              onClick={() => updateStat("fg3m", 1)}
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
      header: "PF",
      cell: ({ row }) => (
        <Input
          id={`pf-input-${row.original.player_team_id}-${row.original.player_id}`}
          type="number"
          value={row.original.P}
          readOnly
          className="w-12 h-7 text-center"
        />
      ),
    },
    {
      accessorKey: "T",
      header: "TF",
      cell: ({ row }) => (
        <Input
          id={`tf-input-${row.original.player_team_id}-${row.original.player_id}`}
          type="number"
          value={row.original.T}
          readOnly
          className="w-12 h-7 text-center"
        />
      ),
    },
  ];

  const table = useReactTable({
    data: players,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="h-9">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <DroppableTableRow key={row.id} player={row.original}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-2">
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
});
