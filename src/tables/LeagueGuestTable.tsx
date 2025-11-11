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
import { Check, Loader2, MoreVertical, X } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/data-table-pagination";

// Hooks
import { useLeagueGuestRequest } from "@/hooks/league-guest";

// Lib
import { getErrorMessage } from "@/lib/error";
import type { Player } from "@/types/player";
import type { Team } from "@/types/team";
import type { GuestRegistrationRequest } from "@/types/guest";
import {
  useLeagueTeams,
  useUpdateLeagueGuestRequest,
} from "@/hooks/useLeagueGuest";
import { Spinner } from "@/components/ui/spinner";

// --- Type Guards ---

// Helper function to check if the 'details' object is a Player
function isPlayer(details: Player | Team): details is Player {
  return (details as Player).full_name !== undefined;
}

// Helper function to check if the 'details' object is a Team
function isTeam(details: Player | Team): details is Team {
  return (details as Team).team_name !== undefined;
}

// --- Types ---

type Props = {
  leagueId?: string;
  leagueCategoryId?: string;
};

type DialogState =
  | { type: "acceptPlayer"; request: GuestRegistrationRequest }
  | { type: "acceptTeam"; request: GuestRegistrationRequest }
  | { type: "reject"; request: GuestRegistrationRequest }
  | { type: null; request: null };

// --- Helper Dialog 1: AcceptPlayerDialog ---

type AcceptPlayerProps = {
  request: GuestRegistrationRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function AcceptPlayerDialog({
  request,
  open,
  onOpenChange,
}: AcceptPlayerProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>();

  const { data: teams, isLoading: isLoadingTeams } = useLeagueTeams(
    request.league_category_id
  );

  const { mutate: updateRequest, isPending } = useUpdateLeagueGuestRequest();

  // Get player name safely
  const playerName =
    request.request_type === "Player" && isPlayer(request.details)
      ? request.details.full_name
      : "Guest Player";

  const handleSubmit = () => {
    if (!selectedTeamId) {
      toast.error("Please select a team to assign the player to.");
      return;
    }

    toast.promise(
      new Promise((resolve, reject) =>
        updateRequest(
          {
            guestRequestId: request.guest_request_id,
            action: "Accepted",
            assignToTeamId: selectedTeamId,
          },
          {
            onSuccess: (data) => {
              onOpenChange(false);
              resolve(data);
            },
            onError: (err) => reject(err),
          }
        )
      ),
      {
        loading: "Assigning player...",
        success: `Player ${playerName} assigned successfully!`,
        error: (err) => getErrorMessage(err),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accept Guest Player</DialogTitle>
          <DialogDescription>
            Select a team to assign <strong>{playerName}</strong> to as a guest.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
            <SelectTrigger disabled={isLoadingTeams}>
              <SelectValue placeholder="Select a team..." />
            </SelectTrigger>
            <SelectContent>
              {isLoadingTeams ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                teams?.map((team) => (
                  <SelectItem key={team.team_id} value={team.team_id}>
                    {team.team_name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedTeamId || isPending || isLoadingTeams}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Helper Dialog 2: ConfirmActionDialog ---

type ConfirmActionProps = {
  request: GuestRegistrationRequest;
  action: "Accepted" | "Rejected";
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function ConfirmActionDialog({
  request,
  action,
  open,
  onOpenChange,
}: ConfirmActionProps) {
  const { mutate: updateRequest, isPending } = useUpdateLeagueGuestRequest();

  // Get entity name safely
  let entityName = "Guest";
  if (request.request_type === "Team" && isTeam(request.details)) {
    entityName = request.details.team_name;
  } else if (request.request_type === "Player" && isPlayer(request.details)) {
    entityName = request.details.full_name;
  }

  const title = action === "Accepted" ? `Accept Request?` : `Reject Request?`;

  const description =
    action === "Accepted"
      ? `Are you sure you want to accept the guest team "${entityName}"?`
      : `Are you sure you want to reject the request for "${entityName}"? This action cannot be undone.`;

  const handleSubmit = () => {
    toast.promise(
      new Promise((resolve, reject) =>
        updateRequest(
          {
            guestRequestId: request.guest_request_id,
            action: action,
          },
          {
            onSuccess: (data) => {
              onOpenChange(false);
              resolve(data);
            },
            onError: (err) => reject(err),
          }
        )
      ),
      {
        loading: "Processing request...",
        success: `Request for ${entityName} has been ${action.toLowerCase()}.`,
        error: (err) => getErrorMessage(err),
      }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            variant={action === "Rejected" ? "destructive" : "primary"}
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm {action}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// --- Main Component: LeagueGuestTable ---

function LeagueGuestTable({ leagueCategoryId }: Props) {
  const queryClient = useQueryClient();
  const { leagueGuestRequestData, leagueGuestRequestLoading } =
    useLeagueGuestRequest(leagueCategoryId);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [dialogState, setDialogState] = useState<DialogState>({
    type: null,
    request: null,
  });

  const columns: ColumnDef<GuestRegistrationRequest>[] = [
    {
      accessorKey: "details",
      header: "Request",
      cell: ({ row }) => {
        const request = row.original;
        const details = request.details;

        // Use the type guards for type-safe access
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
      cell: ({ row }) => {
        const request = row.original;
        if (request.status !== "Pending") {
          return null;
        }
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="text-right">
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                className="text-green-600"
                onSelect={() => {
                  if (request.request_type === "Team") {
                    setDialogState({ type: "acceptTeam", request });
                  } else {
                    setDialogState({ type: "acceptPlayer", request });
                  }
                }}
              >
                <Check className="mr-2 h-4 w-4" />
                Accept
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onSelect={() => setDialogState({ type: "reject", request })}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
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
      await queryClient.invalidateQueries({
        queryKey: ["guestRequests", leagueCategoryId],
      });
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

      {/* --- Render Dialogs --- */}
      {dialogState.type === "acceptPlayer" && dialogState.request && (
        <AcceptPlayerDialog
          request={dialogState.request}
          open={dialogState.type === "acceptPlayer"}
          onOpenChange={(open) =>
            !open && setDialogState({ type: null, request: null })
          }
        />
      )}

      {(dialogState.type === "acceptTeam" || dialogState.type === "reject") &&
        dialogState.request && (
          <ConfirmActionDialog
            request={dialogState.request}
            action={dialogState.type === "acceptTeam" ? "Accepted" : "Rejected"}
            open={
              dialogState.type === "acceptTeam" || dialogState.type === "reject"
            }
            onOpenChange={(open) =>
              !open && setDialogState({ type: null, request: null })
            }
          />
        )}
    </div>
  );
}

export default memo(LeagueGuestTable);
