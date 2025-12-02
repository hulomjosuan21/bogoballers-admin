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
import type { Team } from "@/types/team";
import axiosClient from "@/lib/axiosClient";
import { Badge } from "@/components/ui/badge";
export default function TeamLeaderboardPage() {
  const { data } = useQuery<Team[]>({
    queryKey: ["team-leaderboard"],
    queryFn: async () => {
      const response = await axiosClient.get<Team[]>("/team/leaderboard");

      return response.data;
    },
  });

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: true },
  ]);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);

  const columns = useMemo<ColumnDef<Team>[]>(
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
              <Avatar className="size-8 rounded-md">
                <AvatarImage
                  src={row.original.team_logo_url}
                  alt={row.original.team_name}
                />
                <AvatarFallback>N</AvatarFallback>
              </Avatar>
              <div className="space-y-px">
                <div className="font-medium text-foreground">
                  {row.original.team_name}
                </div>
                <div className="text-muted-foreground text-[10px]">
                  {row.original.coach_name ?? " "}
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
        accessorKey: "total_wins",
        header: () => <span className="text-xs">Total Wins</span>,
        cell: ({ row }) => <span>{row.original.total_wins}</span>,
      },
      {
        accessorKey: "total_losses",
        header: () => <span className="text-xs">Total Losses</span>,
        cell: ({ row }) => <span>{row.original.total_losses}</span>,
      },
      {
        accessorKey: "total_points",
        header: () => <span className="text-xs">Total Points</span>,
        cell: ({ row }) => <span>{row.original.total_points}</span>,
      },
      {
        accessorKey: "is_recruiting",
        header: () => <span className="text-xs">Status</span>,
        cell: ({ row }) => {
          const isRecruiting = row.getValue("is_recruiting");

          return (
            <Badge
              className={
                isRecruiting
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-500 hover:bg-gray-600 text-white"
              }
            >
              {isRecruiting ? "Recruiting" : "Closed"}
            </Badge>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    columns,
    data: data ?? [],
    pageCount: Math.ceil((data?.length || 0) / pagination.pageSize),
    getRowId: (row: Team) => row.team_id,
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

export const PlayerLeaderboard = memo(TeamLeaderboardPage);
