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

import { useState, useMemo, useCallback } from "react";
import { ImageZoom } from "@/components/ui/kibo-ui/image-zoom";
import { formatIsoDate } from "@/helpers/helpers";
import { Badge } from "@/components/ui/badge";
import {
  useCheckPlayerSheet,
  useUpdateLeagueTeamStore,
  useRemoveLeagueTeamStore,
  useRefundDialog,
} from "../stores/leagueTeamStores";
import { toast } from "sonner";
import { useAlertDialog } from "@/hooks/userAlertDialog";
import { LeagueTeamService } from "@/service/leagueTeamService";
import type { LeagueTeam } from "@/types/team";
import { useLeagueTeam } from "@/hooks/useLeagueTeam";
import type {
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";

interface TeamSubmissionTableProps {
  leagueId?: string;
  leagueCategoryId?: string;
}

export function TeamSubmissionTable({
  leagueId,
  leagueCategoryId,
}: TeamSubmissionTableProps) {
  const { leagueTeamLoading, leagueTeamData, refetchLeagueTeam } =
    useLeagueTeam(leagueCategoryId, {
      condition: "Submission",
    });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<LeagueTeam>[] = useMemo(
    () => [
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
          return <span>{team.creator?.email || "N/A"}</span>;
        },
      },
      {
        accessorKey: "contact_number",
        header: "Contact #",
        cell: ({ row }) => {
          const team = row.original;
          return <span>{team.creator?.contact_number || "N/A"}</span>;
        },
      },
      {
        accessorKey: "payment_status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Payment Status
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        ),
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue) return true;
          return row.getValue(columnId) === filterValue;
        },
        cell: ({ row }) => {
          const status = row.original.payment_status;

          if (["Paid Online", "Paid On Site", "No Charge"].includes(status)) {
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
          const count = team.accepted_players?.length || 0;
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
          return (
            <ActionCell
              row={row}
              leagueId={leagueId}
              leagueCategoryId={leagueCategoryId}
              validate={refetchLeagueTeam}
            />
          );
        },
      },
    ],
    [leagueId, leagueCategoryId]
  );

  const tableData = useMemo(() => {
    return leagueTeamData || [];
  }, [leagueTeamData]);

  const table = useReactTable({
    data: tableData,
    columns,
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
                <TableCell colSpan={7} className="h-24 text-center">
                  {leagueTeamLoading ? "Loading..." : "No data."}
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

function ActionCell({
  row,
  leagueId,
  leagueCategoryId,
  validate,
}: {
  row: any;
  leagueId?: string;
  leagueCategoryId?: string;
  validate: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<LeagueTeam[] | null, Error>>;
}) {
  const team = row.original;

  const { dialogOpen } = useCheckPlayerSheet();
  const { openDialog } = useAlertDialog();
  const { updateApi } = useUpdateLeagueTeamStore();
  const { deleteApi } = useRemoveLeagueTeamStore();
  const { dialogOpen: dialogRefundOpen } = useRefundDialog();

  const handleUpdate = useCallback(
    async (data: Partial<LeagueTeam>) => {
      const confirm = await openDialog({
        confirmText: "Confirm",
        cancelText: "Cancel",
      });
      if (!confirm) return;

      const updateTeam = async () => {
        const result = await updateApi(team.league_team_id, data);
        await validate();
        return result;
      };

      toast.promise(updateTeam(), {
        loading: "Updating payment status...",
        success: (res) => res,
        error: (err) => getErrorMessage(err) ?? "Something went wrong!",
      });
    },
    [team.league_team_id, updateApi, openDialog]
  );

  const handleRemove = useCallback(async () => {
    const confirm = await openDialog({
      confirmText: "Confirm",
      cancelText: "Cancel",
    });
    if (!confirm) return;

    const removeTeam = async () => {
      const result = await deleteApi(team.league_team_id);
      return result;
    };

    toast.promise(removeTeam(), {
      loading: "Removing team status...",
      success: (res) => res,
      error: (err) => getErrorMessage(err) ?? "Something went wrong!",
    });
  }, [team.league_team_id, deleteApi, openDialog]);

  const handleAccept = useCallback(async () => {
    if (!leagueId || !leagueCategoryId) return;

    const acceptTeam = async () => {
      const result = await LeagueTeamService.validateEntry(
        leagueId,
        leagueCategoryId,
        team.league_team_id
      );
      await validate();
      return result;
    };

    toast.promise(acceptTeam(), {
      loading: "Validating team entry...",
      success: (res) => res.message,
      error: (err) => getErrorMessage(err) ?? "Something went wrong!",
    });
  }, [leagueId, leagueCategoryId, team.league_team_id]);

  return (
    <div className="text-right">
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
          <DropdownMenuLabel>Set payment status</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => handleUpdate({ payment_status: "Paid On Site" })}
          >
            Paid On Site
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleUpdate({ payment_status: "Paid Online" })}
          >
            Paid Online
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleUpdate({ payment_status: "No Charge" })}
          >
            No Charge
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleAccept}>Accept</DropdownMenuItem>
          <DropdownMenuItem onClick={handleRemove}>Remove</DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              dialogRefundOpen({
                leagueCategoryId: leagueCategoryId!,
                leagueId: leagueId!,
                remove: true,
                message: "",
                data: {
                  amount: 0,
                  league_team_id: team.league_team_id,
                },
              })
            }
          >
            Remove & Refund
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
