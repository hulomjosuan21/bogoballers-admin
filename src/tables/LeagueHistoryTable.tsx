import { memo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error";
import { toast } from "sonner";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import type { League } from "@/types/league";
import { useFetchLeagueGenericData } from "@/hooks/useFetchLeagueGenericData";
import { Spinner } from "@/components/ui/spinner";
import { formatDate12h } from "@/lib/app_utils";
import type { LeagueTeam } from "@/types/team";
import { useLeagueStore } from "@/stores/leagueStore";

type LeagueWithTeam = League & { teams: LeagueTeam[] };

const LeagueHistoryTable = () => {
  const { leagueId, setLeague } = useLeagueStore();
  const { data, isLoading, refetch } = useFetchLeagueGenericData<
    LeagueWithTeam[]
  >({
    key: ["league-record"],
    params: {
      all: true,
      filter: "record",
    },
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  function handleRefresh(): void {
    toast.promise(refetch(), {
      loading: "Refreshing data...",
      success: "Data refreshed!",
      error: (e) => getErrorMessage(e),
    });
  }

  const columns: ColumnDef<LeagueWithTeam>[] = [
    {
      accessorKey: "league_title",
    },
    {
      accessorKey: "teams_count",
      header: "Total Teams",
      cell: ({ row }) => <span>{row.original.teams.length ?? []}</span>,
    },
    {
      accessorKey: "league_created_at",
      header: "League created at",
      cell: ({ row }) => (
        <span>{formatDate12h(row.original.league_created_at)}</span>
      ),
    },
    {
      accessorKey: "actions",
      header: "",
      cell: ({ row }) => {
        const dataLeague = row.original;

        const isSelected = dataLeague.league_id != leagueId;

        return (
          <div className="text-right">
            <Button
              variant={"outline"}
              size={"sm"}
              disabled={isSelected}
              onClick={() => setLeague(dataLeague)}
            >
              {isSelected ? "Already selected" : "Select"}
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  return (
    <div>
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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex justify-center items-center">
                    <Spinner />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No guest requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center mt-2 gap-2">
        <div className="flex-1">
          <DataTablePagination showPageSize={false} table={table} />
        </div>
        <Button variant={"outline"} size={"sm"} onClick={handleRefresh}>
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default memo(LeagueHistoryTable);
