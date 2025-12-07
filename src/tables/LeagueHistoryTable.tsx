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
import { Spinner } from "@/components/ui/spinner";
import { formatDate12h } from "@/lib/app_utils";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axiosClient";
import type { LeagueWithRecord } from "@/types/leagueRecord";
import { useToggleLeagueHistorySection } from "@/stores/leagueHistoryStore";
import { ToggleState } from "@/stores/toggleStore";
import useActiveLeagueMeta from "@/hooks/useActiveLeagueMeta";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

async function fetchRecords() {
  const response = await axiosClient.get<LeagueWithRecord[]>("/league/records");

  return response.data;
}
const LeagueHistoryTable = () => {
  const { league_id } = useActiveLeagueMeta();
  const { data, isLoading, refetch } = useQuery<LeagueWithRecord[]>({
    queryKey: ["league-history-table"],
    queryFn: fetchRecords,
  });

  const { toggle } = useToggleLeagueHistorySection();

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
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Ongoing":
        return "primary";
      case "Completed":
        return "secondary";
      case "Scheduled":
      case "Pending":
        return "outline";
      case "Cancelled":
      case "Rejected":
        return "destructive";
      case "Postponed":
        return "warning";
      default:
        return "secondary";
    }
  };

  const columns: ColumnDef<LeagueWithRecord>[] = [
    {
      accessorKey: "league_title",
      header: "League Title",
      cell: ({ row }) => {
        const isActive = row.original.league_id === league_id;

        return (
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">
              {row.getValue("league_title")}
            </span>
            {isActive && (
              <Badge
                variant="outline"
                className="border-green-600 text-green-600 gap-1 px-2"
              >
                <CheckCircle2 className="h-3 w-3" />
                Active
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;

        return (
          <Badge variant={getStatusVariant(status) as any}>{status}</Badge>
        );
      },
    },
    // ... rest of your columns (registration_deadline, etc.)
    {
      accessorKey: "registration_deadline",
      header: "Registration deadline",
      cell: ({ row }) => (
        <span>{formatDate12h(row.original.registration_deadline)}</span>
      ),
    },
    {
      accessorKey: "opening_date",
      header: "Opening date",
      cell: ({ row }) => (
        <span>{formatDate12h(row.original.opening_date)}</span>
      ),
    },
    {
      accessorKey: "teams_count",
      header: "Total Teams",
      cell: ({ row }) => <span>{row.original.teams?.length ?? 0}</span>,
    },
    {
      accessorKey: "league_match_records",
      header: "Match Records",
      cell: ({ row }) => (
        <span>{row.original.league_match_records?.length ?? 0}</span>
      ),
    },
    {
      accessorKey: "league_categories",
      header: "Total Categories",
      cell: ({ row }) => (
        <span>{row.original.league_categories?.length ?? 0}</span>
      ),
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
        const data = row.original;
        const records = data.league_match_records ?? [];
        return (
          <div className="text-right">
            <Button
              variant="outline"
              size="sm"
              disabled={records.length === 0}
              onClick={() => toggle(data, ToggleState.SHOW_LEAGUE)}
            >
              Select
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
