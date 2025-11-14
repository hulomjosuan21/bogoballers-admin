import { memo, useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/data-table-pagination";
import { useLeagueGuestRequest } from "@/hooks/league-guest";
import { getErrorMessage } from "@/lib/error";
import type { Player } from "@/types/player";
import type { Team } from "@/types/team";
import type { GuestRegistrationRequest } from "@/types/guest";
import { Spinner } from "@/components/ui/spinner";
import { GuestActionCell } from "./LeagueGuestTableComponents";

export function isPlayer(details: Player | Team): details is Player {
  return (details as Player).full_name !== undefined;
}

export function isTeam(details: Player | Team): details is Team {
  return (details as Team).team_name !== undefined;
}

type Props = {
  leagueCategoryId?: string;
};

function LeagueGuestTable({ leagueCategoryId }: Props) {
  const queryClient = useQueryClient();
  const {
    leagueGuestRequestData,
    leagueGuestRequestLoading,
    refetchLeagueGuestRequest,
  } = useLeagueGuestRequest(leagueCategoryId);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<GuestRegistrationRequest>[] = [
    {
      accessorKey: "details",
      header: "Request",
      cell: ({ row }) => {
        const request = row.original;
        const details = request.details;

        if (request.request_type === "Team" && isTeam(details)) {
          return (
            <div className="flex flex-col">
              <span className="font-medium">{details.team_name}</span>
              <span className="text-xs text-muted-foreground">Guest Team</span>
            </div>
          );
        }
        if (request.request_type === "Player" && isPlayer(details)) {
          return (
            <div className="flex flex-col">
              <span className="font-medium">{details.full_name}</span>
              <span className="text-xs text-muted-foreground">
                Guest Player
              </span>
            </div>
          );
        }
        return <span>-</span>;
      },
    },
    {
      accessorKey: "league_category",
      header: "Category",
      cell: ({ row }) => {
        return <span>{row.original.league_category.category_name}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: "default" | "secondary" | "destructive" | "outline" =
          "secondary";
        if (status === "Accepted") variant = "default";
        if (status === "Rejected") variant = "destructive";

        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: "payment_status",
      header: "Payment",
      cell: ({ row }) => {
        const status = row.original.payment_status;
        let variant: "default" | "secondary" | "destructive" | "outline" =
          "outline";
        if (status.startsWith("Paid")) variant = "default";
        if (status === "Pending") variant = "secondary";

        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <GuestActionCell
          request={row.original}
          refresh={() =>
            queryClient.invalidateQueries({
              queryKey: ["guestRequests", leagueCategoryId],
            })
          }
        />
      ),
    },
  ];

  const table = useReactTable({
    data: leagueGuestRequestData,
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

  function handleRefresh(): void {
    const refresh = async () => {
      await refetchLeagueGuestRequest();
    };
    toast.promise(refresh(), {
      loading: "Refreshing data...",
      success: "Data refreshed!",
      error: (e) => getErrorMessage(e),
    });
  }

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
            {leagueGuestRequestLoading ? (
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
}

export default memo(LeagueGuestTable);
