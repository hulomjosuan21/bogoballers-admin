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
import { useState, useMemo, memo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { ImageZoom } from "@/components/ui/kibo-ui/image-zoom";
import type { LeagueTeam } from "@/types/team";
import { useLeagueTeam } from "@/hooks/useLeagueTeam";
import { renderPlacementBadges } from "./LeagueTeamsTable";

type Props = {
  leagueCategoryId?: string;
};

function LegueTeamTable({ leagueCategoryId }: Props) {
  const { leagueTeamData, leagueTeamLoading } = useLeagueTeam(
    leagueCategoryId,
    {
      condition: "RankAndFinalize",
    }
  );

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
                <div className="font-medium text-foreground flex items-center gap-1">
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
    ],
    []
  );

  const tableData = useMemo(() => {
    return leagueTeamData;
  }, [leagueTeamData]);

  const table = useReactTable({
    data: tableData ?? [],
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
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <DataTablePagination showPageSize={false} table={table} />
        </div>
      </div>
    </div>
  );
}

export const LeagueTeamsPublicTable = memo(LegueTeamTable);
