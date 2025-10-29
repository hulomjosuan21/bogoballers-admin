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
import { ArrowUpDown, Copy, MoreVertical } from "lucide-react";
import { ImageZoom } from "@/components/ui/kibo-ui/image-zoom";
import { useAlertDialog } from "@/hooks/userAlertDialog";
import { toast } from "sonner";
import {
  useRemoveLeagueTeamStore,
  useToggleOfficialLeagueTeamSection,
} from "@/stores/leagueTeamStores";
import { ToggleState } from "@/stores/toggleStore";
import type { LeagueTeam } from "@/types/team";
import { useLeagueTeamDynamicQuery } from "@/hooks/useLeagueTeam";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { LeagueTeamService } from "@/service/leagueTeamService";
import { Badge } from "@/components/ui/badge";
import { getOrdinal } from "@/lib/app_utils";

type Props = {
  leagueCategoryId?: string;
  roundId?: string;
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
  roundId,
  viewOnly = false,
}: Props) {
  const {
    dynamicLeagueTeamData,
    dynamicLeagueTeamLoading,
    refetchDynamicLeagueTeam,
  } = useLeagueTeamDynamicQuery(
    QUERY_KEYS.DYNAMIC_KEY_LEAGUE_TEAM_FOR_CHECKED(leagueCategoryId, roundId),
    () => LeagueTeamService.getTeamsChecked(leagueCategoryId!, roundId!)
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
        accessorKey: "league_team_public_id",
        header: "ID",
        cell: ({ row }) => {
          const id = row.getValue("league_team_public_id") as string;

          const handleCopy = async () => {
            try {
              await navigator.clipboard.writeText(id);
              toast.info("Copied to clipboard!");
            } catch {
              toast.error("Failed to copy");
            }
          };

          return (
            <div className="flex items-center gap-2">
              <span className="truncate max-w-[120px]">{id}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-6 w-6"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
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
        id: "actions",
        enableHiding: false,
        columnVisibility: !viewOnly ? true : false,
        cell: ({ row }) => <ActionCell row={row} />,
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

function ActionCell({ row }: { row: any }) {
  const team = row.original;

  const { openDialog } = useAlertDialog();
  const { deleteApi } = useRemoveLeagueTeamStore();
  const { toggle } = useToggleOfficialLeagueTeamSection();

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
      loading: "Removing team...",
      success: (res) => res,
      error: (err) => getErrorMessage(err) ?? "Something went wrong!",
    });
  }, [team.league_team_id, deleteApi, openDialog]);

  const handleToggleLeague = useCallback(() => {
    toggle(team, ToggleState.SHOW_LEAGUE_TEAM);
  }, [team, toggle]);

  const handleBan = useCallback(async () => {
    const confirm = await openDialog({
      confirmText: "Ban Team",
      cancelText: "Cancel",
      title: "Ban Team",
      description: `Are you sure you want to ban "${team.team_name}"? This action may affect their league standings.`,
    });
    if (!confirm) return;

    // TODO: Implement ban functionality
    toast.info("Ban functionality not implemented yet");
  }, [team.team_name, openDialog]);

  const handleRemoveAndRefund = useCallback(async () => {
    const confirm = await openDialog({
      confirmText: "Remove & Refund",
      cancelText: "Cancel",
      title: "Remove Team and Process Refund",
      description: `Are you sure you want to remove "${team.team_name}" and process a refund?`,
    });
    if (!confirm) return;

    // TODO: Implement remove and refund functionality
    toast.info("Remove & Refund functionality not implemented yet");
  }, [team.team_name, openDialog]);

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
          <DropdownMenuItem onClick={handleToggleLeague}>
            Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleBan}>Ban</DropdownMenuItem>
          <DropdownMenuItem onClick={handleRemove}>Remove</DropdownMenuItem>
          <DropdownMenuItem onClick={handleRemoveAndRefund}>
            Remove & Refund
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
