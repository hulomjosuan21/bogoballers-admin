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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table-pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useMemo, useCallback, memo, type JSX } from "react";
import { getErrorMessage } from "@/lib/error";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreVertical, Trash2, Undo2, X } from "lucide-react";
import { ImageZoom } from "@/components/ui/kibo-ui/image-zoom";
import { useAlertDialog } from "@/hooks/userAlertDialog";
import { toast } from "sonner";
import { useToggleOfficialLeagueTeamSection } from "@/stores/leagueTeamStores";
import { ToggleState } from "@/stores/toggleStore";
import type { LeagueTeam } from "@/types/team";
import { useLeagueTeamDynamicQuery } from "@/hooks/useLeagueTeam";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  LeagueTeamService,
  LeagueTeamSubmissionService,
} from "@/service/leagueTeamService";
import { Badge } from "@/components/ui/badge";
import { getOrdinal } from "@/lib/app_utils";
import { RefundDialog } from "./LeagueTeamSubmissionTable";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";

type Props = {
  leagueCategoryId?: string;
  viewOnly?: boolean;
};

export const renderPlacementBadges = (t: LeagueTeam) => {
  const badges: JSX.Element[] = [];

  if (t.is_eliminated) {
    badges.push(
      <Badge key="eliminated" variant="destructive" className="text-xs">
        Eliminated
      </Badge>
    );
  }

  if (t.final_rank === 1) {
    badges.push(
      <Badge key="champion" className="text-xs">
        Champion
      </Badge>
    );
  } else if (t.final_rank === 2) {
    badges.push(
      <Badge key="runnerup" className="text-xs" variant="outline">
        Runner Up
      </Badge>
    );
  } else if (t.final_rank === 3) {
    badges.push(
      <Badge key="third" className="text-xs" variant="secondary">
        Third Place
      </Badge>
    );
  } else if (t.final_rank && t.final_rank > 3) {
    badges.push(
      <Badge key="placer" className="text-xs" variant="outline">
        {getOrdinal(t.final_rank)} Placer
      </Badge>
    );
  }

  return <>{badges}</>;
};
export function LeagueTeamsTable({
  leagueCategoryId,
  viewOnly = false,
}: Props) {
  const {
    dynamicLeagueTeamData,
    dynamicLeagueTeamLoading,
    refetchDynamicLeagueTeam,
  } = useLeagueTeamDynamicQuery(
    QUERY_KEYS.DYNAMIC_KEY_LEAGUE_TEAM_FOR_CHECKED(leagueCategoryId),
    () => LeagueTeamService.getTeamsChecked(leagueCategoryId!)
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    actions: !viewOnly,
  });
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
            <div className="flex items-center gap-3">
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
              <div className="space-y-px">
                <div className="font-medium text-foreground flex gap-1 items-center">
                  {row.original.team_name} {renderPlacementBadges(row.original)}
                </div>
                <div className="text-xs text-muted-foreground">
                  wins:{row.original.wins} losses:{row.original.losses}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
      },
      {
        accessorKey: "final_rank",
        header: "Rank",
        cell: ({ row }) => {
          const final_rank = row.original.final_rank;
          if (!final_rank) return <span>N/A</span>;
          return <span>#{final_rank}</span>;
        },
      },
      {
        accessorKey: "league_players",
        header: "Players count",
        cell: ({ row }) => {
          const team = row.original;
          return <span>{team.league_players?.length || 0}</span>;
        },
      },
      {
        accessorKey: "points",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total points
            <ArrowUpDown className="ml-1 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.points || 0}</span>
        ),
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
        accessorKey: "matches_remaining",
        header: "Remaining matches",
      },
      {
        id: "upcoming_opponents",
        header: "Upcoming Opponents",
        cell: ({ row }) => {
          const opponents = row.original.upcoming_opponents || [];

          if (!opponents.length) return "N/A";

          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  Show Opponents ({opponents.length})
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-48">
                <div className="stat-list-compact">
                  {opponents.map((op, i) => (
                    <div key={i} className="stat-item-compact">
                      <span className="stat-label-compact">{i + 1}.</span>
                      <span className="stat-value-compact">{op.team_name}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          );
        },
      },
      {
        id: "actions",
        enableHiding: false,
        columnVisibility: !viewOnly ? true : false,
        cell: ({ row }) => (
          <ActionCell row={row} validate={refetchDynamicLeagueTeam} />
        ),
      },
    ],
    [viewOnly]
  );

  function handleRefresh(): void {
    const refresh = async () => {
      await refetchDynamicLeagueTeam();
    };

    toast.promise(refresh(), {
      loading: "Loading...",
      success: "Done",
      error: (e) => getErrorMessage(e),
    });
  }

  const tableData = useMemo(() => {
    return dynamicLeagueTeamData;
  }, [dynamicLeagueTeamData]);

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
                  {dynamicLeagueTeamLoading ? "Loading..." : "No data."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex gap-2 items-center">
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

export default memo(LeagueTeamsTable);

export function ActionCell({
  row,
  validate,
}: {
  row: Row<LeagueTeam>;
  validate: () => Promise<any>;
}) {
  const team = row.original;
  const navigate = useNavigate();
  const linkPath = `/portal/league-administrator/start-chat/${row.original.user_id}/${row.original.team_name}`;
  const { openDialog } = useAlertDialog();
  const { toggle } = useToggleOfficialLeagueTeamSection();

  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundParams, setRefundParams] = useState<{
    remove: boolean;
    title: string;
  }>({
    remove: false,
    title: "",
  });

  const handleOpenDetails = () => toggle(team, ToggleState.SHOW_LEAGUE_TEAM);

  const handleRemove = async () => {
    const confirm = await openDialog({
      title: "Remove Team",
      description: `Remove "${team.team_name}" from the league? This cannot be undone.`,
      confirmText: "Remove",
      cancelText: "Cancel",
    });
    if (!confirm) return;

    const remove = async () => {
      const result = await LeagueTeamSubmissionService.removeSubmission(
        team.league_team_id
      );
      await validate();
      return result;
    };

    toast.promise(remove(), {
      loading: "Removing team...",
      success: (res) => res.message ?? "Team removed",
      error: (err) => getErrorMessage(err) ?? "Failed to remove team",
    });
  };

  const openRefundDialog = (removeAfterRefund: boolean) => {
    setRefundParams({
      remove: removeAfterRefund,
      title: removeAfterRefund
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
        initialAmount={team.amount_paid || 0}
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

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                navigate(linkPath);
              }}
            >
              Chat
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenDetails}>
              View Details
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Payment & Refund</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => openRefundDialog(false)}>
              <Undo2 className="mr-2 h-4 w-4" />
              Refund Only
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-destructive">
              Danger Zone
            </DropdownMenuLabel>

            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleRemove}
            >
              <X className="mr-2 h-4 w-4" />
              Ban Team
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => openRefundDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove & Refund
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
