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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLeagueMatch } from "@/hooks/leagueMatch";
import type { LeagueMatch } from "@/types/leagueMatch";
import { ImageZoom } from "@/components/ui/kibo-ui/image-zoom";
import { Badge } from "@/components/ui/badge";
import { formatDate12h } from "@/lib/app_utils";
import { DataTablePagination } from "@/components/data-table-pagination";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";
import { memo, useState } from "react";

type Props = {
  leagueCategoryId?: string;
  roundId?: string;
  viewOnly?: boolean;
};

function MatchesTable({ leagueCategoryId, roundId, viewOnly = false }: Props) {
  const {
    leagueMatchData,
    leagueMatchLoading,
    leagueMatchError,
    refetchLeagueMatch,
  } = useLeagueMatch(leagueCategoryId, roundId, {
    condition: "ByRound",
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const columns: ColumnDef<LeagueMatch>[] = [
    {
      accessorKey: "home-team",
      header: "Home Team",
      cell: ({ row }) => {
        const { home_team } = row.original;
        const team = home_team;

        return (
          <div className="flex items-center gap-3">
            {team?.team_logo_url ? (
              <ImageZoom>
                <img
                  src={team.team_logo_url}
                  alt={team.team_name ?? "Unknown Team"}
                  className="h-8 w-8 rounded-sm object-cover cursor-pointer"
                />
              </ImageZoom>
            ) : (
              <div className="h-8 w-8 rounded-md bg-muted" />
            )}
            <div className="space-y-px">
              <div className="font-medium text-foreground">
                {team?.team_name ?? "TBD"}{" "}
                {row.original.winner_team_id != null &&
                  (row.original.winner_team_id === team?.league_team_id ? (
                    <Badge className="text-xs">Winner</Badge>
                  ) : (
                    <Badge className="text-xs" variant="destructive">
                      Loser
                    </Badge>
                  ))}
              </div>
              <div className="text-xs text-muted-foreground">
                wins:{team?.wins ?? 0} losses:{team?.losses ?? 0}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "away-team",
      header: "Away Team",
      cell: ({ row }) => {
        const { away_team } = row.original;
        const team = away_team;

        return (
          <div className="flex items-center gap-3">
            {team?.team_logo_url ? (
              <ImageZoom>
                <img
                  src={team.team_logo_url}
                  alt={team.team_name ?? "TBD"}
                  className="h-8 w-8 rounded-sm object-cover cursor-pointer"
                />
              </ImageZoom>
            ) : (
              <div className="h-8 w-8 rounded-md bg-muted" />
            )}
            <div className="space-y-px">
              <div className="font-medium text-foreground">
                {team?.team_name ?? "TBD"}{" "}
                {row.original.winner_team_id != null &&
                  (row.original.winner_team_id === team?.league_team_id ? (
                    <Badge className="text-xs">Winner</Badge>
                  ) : (
                    <Badge className="text-xs" variant="destructive">
                      Loser
                    </Badge>
                  ))}
              </div>
              <div className="text-xs text-muted-foreground">
                wins:{team?.wins ?? 0} losses:{team?.losses ?? 0}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "home_team_score",
      header: "Home team score",
    },
    {
      accessorKey: "away_team_score",
      header: "Away team score",
    },
    {
      accessorKey: "display_name",
      header: "Detail",
    },
    {
      accessorKey: "scheduled_date",
      header: "Scheduled date",
      cell: ({ row }) => (
        <span>{formatDate12h(row.original.scheduled_date!)}</span>
      ),
    },
  ];

  const table = useReactTable({
    data: leagueMatchData ?? [],
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
      await refetchLeagueMatch();
    };

    toast.promise(refresh(), {
      loading: "Loading...",
      success: "Done",
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
            {table.getRowModel().rows?.length ? (
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
                  {leagueMatchLoading
                    ? "Loading data..."
                    : leagueMatchError
                    ? leagueMatchError.message
                    : "No finished matches"}
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
        {!viewOnly && (
          <Button variant={"outline"} size={"sm"} onClick={handleRefresh}>
            Refresh
          </Button>
        )}
      </div>
    </div>
  );
}

export const LeagueMatchesTable = memo(MatchesTable);
