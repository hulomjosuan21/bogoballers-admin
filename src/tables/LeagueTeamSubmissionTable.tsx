import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  CheckIcon,
  MoreVertical,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
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

import { useState, useMemo, useCallback, useEffect, memo } from "react";
import { ImageZoom } from "@/components/ui/kibo-ui/image-zoom";
import { formatIsoDate } from "@/helpers/helpers";
import { Badge } from "@/components/ui/badge";

import { useCheckPlayerSheet } from "../stores/leagueTeamStores";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAlertDialog } from "@/hooks/userAlertDialog";
import { LeagueTeamSubmissionService } from "@/service/leagueTeamService";
import type { LeagueTeam } from "@/types/team";
import { useLeagueTeam } from "@/hooks/useLeagueTeam";
import type {
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TeamSubmissionTableProps {
  leagueId?: string;
  leagueCategoryId?: string;
}

function SubmissionTable({
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

          if (
            [
              "Paid Online",
              "Paid On Site",
              "No Charge",
              "Refunded",
              "Partially Refunded",
            ].includes(status)
          ) {
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
        accessorKey: "amount_paid",
        header: "Amount Paid",
        cell: ({ row }) => {
          const amount = row.original.amount_paid;
          return (
            <span>
              {new Intl.NumberFormat("en-PH", {
                style: "currency",
                currency: "PHP",
              }).format(amount)}
            </span>
          );
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

  function handleRefresh(): void {
    const refresh = async () => {
      await refetchLeagueTeam();
    };

    toast.promise(refresh(), {
      loading: "Loading...",
      success: "Done",
      error: (e) => getErrorMessage(e),
    });
  }

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
                <TableCell colSpan={8} className="h-24 text-center">
                  {leagueTeamLoading ? "Loading..." : "No data."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <DataTablePagination showPageSize={true} table={table} />
        </div>
        <Button variant={"outline"} size={"sm"} onClick={handleRefresh}>
          Refresh
        </Button>
      </div>
    </div>
  );
}

interface RefundDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: { amount: number; reason: string }) => void;
  title: string;
  initialAmount: number;
}

export function RefundDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialAmount,
}: RefundDialogProps) {
  const [amount, setAmount] = useState(String(initialAmount));
  const [reason, setReason] = useState("Requested by customer");

  useEffect(() => {
    setAmount(String(initialAmount));
  }, [initialAmount, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Please enter a valid amount greater than zero.");
      return;
    }
    onSubmit({ amount: numericAmount, reason });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Enter the amount to refund. This action will be recorded.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                step="0.01"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Confirm Refund</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export function ActionCell({
  row,
  leagueId,
  leagueCategoryId,
  validate,
}: {
  row: Row<LeagueTeam>;
  leagueId?: string;
  leagueCategoryId?: string;
  validate: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<LeagueTeam[] | null, Error>>;
}) {
  const team = row.original;
  const { dialogOpen } = useCheckPlayerSheet();
  const { openDialog } = useAlertDialog();

  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundParams, setRefundParams] = useState({
    remove: false,
    title: "",
  });

  const handleUpdate = useCallback(
    async (data: Partial<LeagueTeam>, successMessage: string) => {
      const confirm = await openDialog({
        title: "Are you sure?",
        description: `This will update the team's status.`,
        confirmText: "Confirm",
        cancelText: "Cancel",
      });
      if (!confirm) return;

      const updateTeam = async () => {
        const result = await LeagueTeamSubmissionService.updateSubmission(
          team.league_team_id,
          data
        );
        await validate();
        return result;
      };

      toast.promise(updateTeam(), {
        loading: "Updating team...",
        success: () => successMessage,
        error: (err) => getErrorMessage(err) ?? "Something went wrong!",
      });
    },
    [team.league_team_id, openDialog, validate]
  );

  const handleRemove = useCallback(async () => {
    const confirm = await openDialog({
      title: "Confirm Removal",
      description: `Are you sure you want to remove ${team.team_name}? This action cannot be undone.`,
      confirmText: "Confirm & Remove",
      cancelText: "Cancel",
    });
    if (!confirm) return;

    const removeTeam = async () => {
      const result = await LeagueTeamSubmissionService.removeSubmission(
        team.league_team_id
      );
      await validate();
      return result;
    };

    toast.promise(removeTeam(), {
      loading: "Removing team...",
      success: (res) => res.message,
      error: (err) => getErrorMessage(err) ?? "Something went wrong!",
    });
  }, [team.league_team_id, team.team_name, openDialog, validate]);

  const handleAccept = useCallback(async () => {
    if (!leagueId || !leagueCategoryId) return;
    const acceptTeam = async () => {
      const result = await LeagueTeamSubmissionService.validateEntry(
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
  }, [leagueId, leagueCategoryId, team.league_team_id, validate]);

  const handleOpenRefundDialog = (remove: boolean) => {
    setRefundParams({
      remove,
      title: remove
        ? `Remove & Refund ${team.team_name}`
        : `Refund ${team.team_name}`,
    });
    setIsRefundDialogOpen(true);
  };

  const handleProcessRefund = useCallback(
    (details: { amount: number; reason: string }) => {
      const processRefundAction = async () => {
        const result = await LeagueTeamSubmissionService.processRefund({
          league_team_id: team.league_team_id,
          amount: details.amount,
          remove: refundParams.remove,
          reason: details.reason,
        });
        await validate();
        return result;
      };

      toast.promise(processRefundAction(), {
        loading: "Processing refund...",
        success: (res) => res.message,
        error: (err) => getErrorMessage(err) ?? "Something went wrong!",
      });
    },
    [team.league_team_id, refundParams.remove, validate]
  );

  return (
    <>
      <RefundDialog
        isOpen={isRefundDialogOpen}
        onClose={() => setIsRefundDialogOpen(false)}
        onSubmit={handleProcessRefund}
        title={refundParams.title}
        initialAmount={team.amount_paid}
      />
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
            <DropdownMenuItem onClick={handleAccept}>Accept</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Payment</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                handleUpdate(
                  { payment_status: "Paid On Site" },
                  "Status set to Paid On Site."
                )
              }
            >
              Set as Paid On Site
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                handleUpdate(
                  { payment_status: "Paid Online" },
                  "Status set to Paid Online."
                )
              }
            >
              Set as Paid Online
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                handleUpdate(
                  { payment_status: "No Charge" },
                  "Status set to No Charge."
                )
              }
            >
              Set as No Charge
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenRefundDialog(false)}>
              <Undo2 className="mr-2 h-4 w-4" />
              <span>Refund</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Danger Zone</DropdownMenuLabel>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleRemove}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Remove</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => handleOpenRefundDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Remove & Refund</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

export const TeamSubmissionTable = memo(SubmissionTable);
