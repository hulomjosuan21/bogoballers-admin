import { memo, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataGrid, DataGridContainer } from "@/components/ui/data-grid";
import { DataGridPagination } from "@/components/ui/data-grid-pagination";
import { DataGridTable } from "@/components/ui/data-grid-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  type ColumnDef,
  type ColumnOrderState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { getPlayerLeaderboardQueryOption } from "@/queries/player";
import type { Player } from "@/types/player";
export default function PlayerLeaderboardTable() {
  const { data } = useQuery(getPlayerLeaderboardQueryOption);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: true },
  ]);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);

  const columns = useMemo<ColumnDef<Player>[]>(
    () => [
      {
        accessorKey: "name",
        id: "name",
        header: "Player",
        cell: ({ row }) => {
          const rank = row.index + 1;
          let rankClass = "";
          if (rank === 1) rankClass = "text-black font-extrabold text-primary";
          else if (rank === 2) rankClass = "font-bold";
          else if (rank === 3) rankClass = "font-semibold";

          return (
            <div className="flex items-center gap-3">
              <span className={rankClass}>{rank}</span>
              <Avatar className="size-8">
                <AvatarImage
                  src={row.original.profile_image_url}
                  alt={row.original.full_name}
                />
                <AvatarFallback>N</AvatarFallback>
              </Avatar>
              <div className="space-y-px">
                <div className="font-medium text-foreground">
                  {row.original.full_name}
                </div>
                <div className="text-muted-foreground">
                  {row.original.user.email}
                </div>
              </div>
            </div>
          );
        },
        size: 250,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorKey: "total_games_played",
        header: () => <span className="text-xs">Total Games Played</span>,
        cell: ({ row }) => <span>{row.original.total_games_played}</span>,
      },
      {
        accessorKey: "total_points_scored",
        header: () => <span className="text-xs">Total Points Scored</span>,
        cell: ({ row }) => <span>{row.original.total_points_scored}</span>,
      },
      {
        accessorKey: "total_assists",
        header: () => <span className="text-xs">Total Assists</span>,
        cell: ({ row }) => <span>{row.original.total_assists}</span>,
      },
      {
        accessorKey: "total_rebounds",
        header: () => <span className="text-xs">Total Rebounds</span>,
        cell: ({ row }) => <span>{row.original.total_rebounds}</span>,
      },
      {
        accessorKey: "total_steals",
        header: () => <span className="text-xs">Total Steals</span>,
        cell: ({ row }) => <span>{row.original.total_steals}</span>,
      },
      {
        accessorKey: "total_blocks",
        header: () => <span className="text-xs">Total Blocks</span>,
        cell: ({ row }) => <span>{row.original.total_blocks}</span>,
      },
      {
        accessorKey: "total_turnovers",
        header: () => <span className="text-xs">Total Turnovers</span>,
        cell: ({ row }) => <span>{row.original.total_turnovers}</span>,
      },
      {
        accessorKey: "fg2_percentage_per_game",
        header: () => <span className="text-xs">2PT%</span>,
        cell: ({ row }) => <span>{row.original.fg2_percentage_per_game}%</span>,
      },
      {
        accessorKey: "fg3_percentage_per_game",
        header: () => <span className="text-xs">3PT%</span>,
        cell: ({ row }) => <span>{row.original.fg3_percentage_per_game}%</span>,
      },
      {
        accessorKey: "ft_percentage_per_game",
        header: () => <span className="text-xs">FT%</span>,
        cell: ({ row }) => <span>{row.original.ft_percentage_per_game}%</span>,
      },
      {
        accessorKey: "total_join_league",
        header: () => <span className="text-xs">Total Joined League</span>,
        cell: ({ row }) => <span>{row.original.total_join_league}</span>,
      },
      {
        accessorKey: "platform_points",
        header: () => <span className="text-xs">Platform Points</span>,
        cell: ({ row }) => (
          <span>{row.original.platform_points.toFixed(2)}</span>
        ),
      },
      {
        accessorKey: "platform_points_per_game",
        header: () => <span className="text-xs">Platform Points per Game</span>,
        cell: ({ row }) => (
          <span>{row.original.platform_points_per_game.toFixed(2)}</span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    columns,
    data: data ?? [],
    pageCount: Math.ceil((data?.length || 0) / pagination.pageSize),
    getRowId: (row: Player) => row.player_id,
    state: { pagination, sorting, columnOrder },
    manualSorting: true,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full">
      <DataGrid
        table={table}
        recordCount={data?.length || 0}
        tableLayout={{ cellBorder: true }}
      >
        <div className="w-full space-y-2">
          <DataGridContainer>
            <ScrollArea className="w-full overflow-x-auto">
              <div className="min-w-[900px]">
                <DataGridTable />
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </DataGridContainer>
          <DataGridPagination />
        </div>
      </DataGrid>
    </div>
  );
}

export const PlayerLeaderboard = memo(PlayerLeaderboardTable);
