import { useMemo, useState } from "react";
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
import type { PlayerModel } from "@/types/player";
import { useQuery } from "@tanstack/react-query";
import { getPlayerLeaderboardQueryOption } from "@/queries/player";
export default function PlayerLeaderboard() {
  const { data } = useQuery(getPlayerLeaderboardQueryOption);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: true },
  ]);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);

  const columns = useMemo<ColumnDef<PlayerModel>[]>(
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
        header: "Total Games Played",
        cell: ({ row }) => <span>{row.original.total_games_played}</span>,
        size: 100,
      },
      {
        accessorKey: "total_points_scored",
        header: "Total points scored",
        cell: ({ row }) => <span>{row.original.total_points_scored}</span>,
        size: 100,
      },
      {
        accessorKey: "total_assists",
        header: () => <span className="text-xs">Total assists</span>,
        cell: ({ row }) => <span>{row.original.total_assists}</span>,
        size: 100,
      },
      {
        accessorKey: "total_rebounds",
        header: () => <span className="text-xs">Total rebounds</span>,
        cell: ({ row }) => <span>{row.original.total_rebounds}</span>,
        size: 100,
      },
      {
        accessorKey: "total_join_league",
        header: () => <span className="text-xs">Total joined league</span>,
        cell: ({ row }) => <span>{row.original.total_join_league}</span>,
        size: 100,
      },
    ],
    []
  );

  const table = useReactTable({
    columns,
    data: data ?? [],
    pageCount: Math.ceil((data?.length || 0) / pagination.pageSize),
    getRowId: (row: PlayerModel) => row.player_id,
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
    <div className="">
      <ScrollArea>
        <DataGrid
          table={table}
          recordCount={data?.length || 0}
          tableLayout={{ cellBorder: true }}
        >
          <div className="w-full space-y-2">
            <DataGridContainer>
              <ScrollArea>
                <DataGridTable />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </DataGridContainer>
            <DataGridPagination />
          </div>
        </DataGrid>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
