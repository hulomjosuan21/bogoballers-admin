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
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, CheckIcon, MoreVertical, X } from "lucide-react";
import { getErrorMessage } from "@/lib/error";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table-pagination";

import type { LeagueTeamModel } from "@/types/team";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllLeagueTeamsSubmissionQueryOptions } from "@/queries/league_team";
import { ImageZoom } from "@/components/ui/kibo-ui/image-zoom";
import { formatIsoDate } from "@/helpers/helpers";
import { Badge } from "@/components/ui/badge";
import {
  useCheckPlayerSheet,
  useDeleteTeamStore,
  useUpdateTeamStore,
} from "./store";
import { toast } from "sonner";
import { useAlertDialog } from "@/hooks/user-alert-dialog";

interface TeamSubmissionTableProps {
  leagueId?: string;
  leagueCategoryId?: string;
  isLoading: boolean;
}

export const columns = ({
  leagueId,
  leagueCategoryId,
}: {
  leagueId?: string;
  leagueCategoryId?: string;
}): ColumnDef<LeagueTeamModel>[] => [
  {
    accessorKey: "team_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Team Name
        <ArrowUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const team = row.original;
      return (
        <div className="flex items-center gap-2">
          {team.team_logo_url ? (
            <ImageZoom>
              <img
                src={team.team_logo_url}
                alt={team.team_name}
                className="h-8 w-8 rounded-sm object-cover cursor-pointer"
              />
            </ImageZoom>
          ) : (
            <div className="h-8 w-8 rounded-md bg-muted" />
          )}
          <span className="font-medium">{team.team_name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const team = row.original;
      return <span>{team.user.email}</span>;
    },
  },
  {
    accessorKey: "contact_number",
    header: "Contact #",
    cell: ({ row }) => {
      const team = row.original;
      return <span>{team.user.contact_number}</span>;
    },
  },
  {
    accessorKey: "payment_status",
    header: "Payment Status",
    cell: ({ row }) => {
      const status = row.original.payment_status;

      if (["Paid Online", "Paid On Site", "Waived"].includes(status)) {
        return (
          <Badge variant="outline" className="gap-1">
            <CheckIcon
              className="text-emerald-500"
              size={12}
              aria-hidden="true"
            />
            {status}
          </Badge>
        );
      } else {
        return (
          <Badge variant="outline" className="gap-1">
            <X className="text-red-500" size={12} aria-hidden="true" />
            {status}
          </Badge>
        );
      }
    },
  },
  {
    accessorKey: "players_count",
    header: "Players Count",
    cell: ({ row }) => {
      const team = row.original;
      const count = team.accepted_players.length;
      return <div className="capitalize">{count}</div>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Submitted at",
    cell: ({ row }) => (
      <span className="capitalize">
        {formatIsoDate(row.getValue("created_at"))}
      </span>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const team = row.original;

      const { dialogOpen } = useCheckPlayerSheet();

      const { refetch } = useQuery(
        getAllLeagueTeamsSubmissionQueryOptions({
          leagueId,
          leagueCategoryId,
        })
      );

      const { openDialog, AlertDialogComponent } = useAlertDialog();

      const { deleteApi } = useDeleteTeamStore();

      const handleDelete = async () => {
        const confirm = await openDialog({
          confirmText: "Remove",
          cancelText: "Cancel",
        });
        if (!confirm) return;
        toast.promise(
          deleteApi(team.league_team_id).then((res) => {
            refetch();
            return res;
          }),
          {
            loading: "Removing team...",
            success: (res) => res,
            error: (err) => getErrorMessage(err) ?? "Failed to remove team",
          }
        );
      };

      const { updateApi } = useUpdateTeamStore();

      const handleUpdate = async (data: Partial<LeagueTeamModel>) => {
        const confirm = await openDialog({
          confirmText: "Confirm",
          cancelText: "Cancel",
        });
        if (!confirm) return;
        toast.promise(
          updateApi(team.league_team_id, data).then((res) => {
            refetch();
            return res;
          }),
          {
            loading: "Updating payment status...",
            success: (res) => res,
            error: (err) => getErrorMessage(err) ?? "Something went wrong!",
          }
        );
      };

      return (
        <div className="text-right">
          <AlertDialogComponent />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => dialogOpen(team)}>
                Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleUpdate({ payment_status: "Paid On Site" })}
              >
                Set Paid On Site
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete}>Remove</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleUpdate({ status: "Accepted" })}
              >
                Accept
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export function TeamSubmissionTable({
  leagueId,
  leagueCategoryId,
  isLoading,
}: TeamSubmissionTableProps) {
  const { data } = useQuery(
    getAllLeagueTeamsSubmissionQueryOptions({
      leagueId,
      leagueCategoryId,
    })
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: data ?? ([] as LeagueTeamModel[]),
    columns: columns({
      leagueId: leagueId,
      leagueCategoryId: leagueCategoryId,
    }),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="space-y-2">
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
                <TableCell colSpan={6} className="h-24 text-center">
                  {isLoading ? "Loading..." : "No data."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination showPageSize={false} table={table} />
    </div>
  );
}
