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
import { type Action } from "@/context/GameContext";
import { DroppableTableRow } from "./DroppableTableRow";
import { memo } from "react";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/components/ui/button-group";

type Props = {
  viewMode?: boolean;
  players: PlayerBook[];
  dispatch: React.Dispatch<Action>;
  currentQuarter: number;
};

export const PlayerOnTheFloorTable = memo(function PlayerOnTheFloorTable({
  viewMode,
  players,
  dispatch,
  currentQuarter,
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
      header: "QTR Score",
      cell: ({ row }) => {
        const player = row.original;
        const qtrScoreData = player.score_per_qtr.find(
          (s) => s.qtr === currentQuarter
        );
        const currentQtrScore = qtrScoreData?.score ?? 0;

        const handleScoreChange = (value: string) => {
          const numericValue = parseInt(value, 10);
          if (!isNaN(numericValue)) {
            dispatch({
              type: "SET_PLAYER_SCORE_FOR_QUARTER",
              payload: {
                teamId: player.player_team_id,
                playerId: player.player_id,
                quarter: currentQuarter,
                value: numericValue,
              },
            });
          }
        };

        const updateStat = (
          stat: keyof PlayerStatsSummary | "P" | "T", // Allow P and T for +/- fouls
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
            {/* Dropdown Menu - Now only contains Stats (+) and Fouls (+) */}
            {!viewMode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-1">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Stats</DropdownMenuLabel>
                  {/* Minus options are REMOVED */}
                  <DropdownMenuGroup className="group-sm">
                    <DropdownMenuItem
                      className="menu-sm"
                      onSelect={() => updateStat("reb", 1)}
                    >
                      + REB
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="menu-sm"
                      onSelect={() => updateStat("ast", 1)}
                    >
                      + AST
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuGroup className="group-sm">
                    <DropdownMenuItem
                      className="menu-sm"
                      onSelect={() => updateStat("stl", 1)}
                    >
                      + STL
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="menu-sm"
                      onSelect={() => updateStat("blk", 1)}
                    >
                      + BLK
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuGroup className="group-sm">
                    <DropdownMenuItem
                      className="menu-sm"
                      onSelect={() => updateStat("tov", 1)}
                    >
                      + TOV
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Fouls</DropdownMenuLabel>
                  <DropdownMenuGroup className="group-sm">
                    <DropdownMenuItem
                      className="menu-sm"
                      onSelect={() => updateStat("P", 1)}
                    >
                      + PF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="menu-sm"
                      onSelect={() => updateStat("T", 1)}
                    >
                      + TF
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Editable Score Input */}
            <Input
              id={`score-input-${player.player_team_id}-${player.player_id}`}
              type="number"
              value={currentQtrScore}
              onChange={(e) => handleScoreChange(e.target.value)}
              disabled={viewMode}
              className="w-12 h-7 text-center font-bold"
              variant={"sm"}
            />

            {!viewMode && (
              <div className="flex gap-1">
                <ButtonGroup>
                  <Button
                    size="sm"
                    variant="dashed"
                    className="h-7 px-1.5 text-[10px] leading-none"
                    onClick={() => updateStat("fta", 1)}
                  >
                    miss
                  </Button>
                  <ButtonGroupSeparator />
                  <Button
                    size="sm"
                    className="h-7 px-1.5"
                    onClick={() => updateStat("ftm", 1)}
                  >
                    +1
                  </Button>
                </ButtonGroup>
                {/* 2 Pointers Group */}
                <ButtonGroup>
                  <Button
                    size="sm"
                    variant="dashed"
                    className="h-7 px-1.5 text-[10px] leading-none"
                    onClick={() => updateStat("fg2a", 1)}
                  >
                    miss
                  </Button>
                  <ButtonGroupSeparator />
                  <Button
                    size="sm"
                    className="h-7 px-1.5"
                    onClick={() => updateStat("fg2m", 1)}
                  >
                    +2
                  </Button>
                </ButtonGroup>
                {/* 3 Pointers Group */}
                <ButtonGroup>
                  <Button
                    size="sm"
                    variant="dashed"
                    className="h-7 px-1.5 text-[10px] leading-none"
                    onClick={() => updateStat("fg3a", 1)}
                  >
                    miss
                  </Button>
                  <ButtonGroupSeparator />
                  <Button
                    size="sm"
                    className="h-7 px-1.5"
                    onClick={() => updateStat("fg3m", 1)}
                  >
                    +3
                  </Button>
                </ButtonGroup>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "P",
      header: "PF",
      cell: ({ row }) => {
        const player = row.original;
        const handleFoulChange = (value: string) => {
          const numericValue = parseInt(value, 10);
          if (!isNaN(numericValue)) {
            dispatch({
              type: "SET_PLAYER_STAT",
              payload: {
                teamId: player.player_team_id,
                playerId: player.player_id,
                stat: "P",
                value: numericValue,
              },
            });
          }
        };
        return (
          <Input
            id={`pf-input-${player.player_team_id}-${player.player_id}`}
            type="number"
            value={player.P}
            onChange={(e) => handleFoulChange(e.target.value)}
            disabled={viewMode}
            variant={"sm"}
            className="w-18"
          />
        );
      },
    },
    {
      accessorKey: "T",
      header: "TF",
      cell: ({ row }) => {
        const player = row.original;
        const handleFoulChange = (value: string) => {
          const numericValue = parseInt(value, 10);
          if (!isNaN(numericValue)) {
            dispatch({
              type: "SET_PLAYER_STAT",
              payload: {
                teamId: player.player_team_id,
                playerId: player.player_id,
                stat: "T",
                value: numericValue,
              },
            });
          }
        };
        return (
          <Input
            id={`tf-input-${player.player_team_id}-${player.player_id}`}
            type="number"
            value={player.T}
            onChange={(e) => handleFoulChange(e.target.value)}
            disabled={viewMode}
            variant={"sm"}
            className="w-18"
          />
        );
      },
    },
  ];

  const table = useReactTable({
    data: players,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border overflow-x-auto">
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
