import type { LeagueMatch } from "@/types/leagueMatch";
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
import { memo, useState } from "react";
import { ImageZoom } from "@/components/ui/kibo-ui/image-zoom";
import { renderPlacementBadges } from "./LeagueTeamsTable";
import { DataTablePagination } from "@/components/data-table-pagination";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";
import { ArrowUpDown } from "lucide-react";
import { formatDate12h } from "@/lib/app_utils";

type Props = {
  data: Partial<LeagueMatch>[];
  isLoading: boolean;
  refresh: () => Promise<any>;
  controlls?: boolean;
  label?: string;
  excludeFields?: (keyof LeagueMatch)[];
};

const LeagueMatchStaticDisplayTable = memo(
  ({ data, isLoading, controlls, label, excludeFields }: Props) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
      {}
    );

    const [rowSelection, setRowSelection] = useState({});
    function handleRefresh(): void {
      const refresh = async () => {
        await refresh();
      };

      toast.promise(refresh(), {
        loading: "Loading...",
        success: "Done",
        error: (e) => getErrorMessage(e),
      });
    }

    const baseColumns: ColumnDef<Partial<LeagueMatch>>[] = [
      {
        header: "Home Team",
        cell: ({ row }) => {
          const h = row.original.home_team!;

          return (
            <div className="flex items-center gap-3">
              {h.team_logo_url ? (
                <ImageZoom>
                  <img
                    src={h.team_logo_url}
                    alt={h.team_name}
                    className="h-8 w-8 rounded-sm object-cover cursor-pointer"
                  />
                </ImageZoom>
              ) : (
                <div className="h-8 w-8 rounded-md bg-muted" />
              )}
              <div className="space-y-px">
                <div className="font-medium text-foreground flex gap-1 items-center">
                  {h.team_name} {renderPlacementBadges(h)}
                </div>
                <div className="text-xs text-muted-foreground">
                  wins:{h.wins} losses:{h.losses}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        header: "Away Team",
        cell: ({ row }) => {
          const a = row.original.away_team!;

          return (
            <div className="flex items-center gap-3">
              {a.team_logo_url ? (
                <ImageZoom>
                  <img
                    src={a.team_logo_url}
                    alt={a.team_name}
                    className="h-8 w-8 rounded-sm object-cover cursor-pointer"
                  />
                </ImageZoom>
              ) : (
                <div className="h-8 w-8 rounded-md bg-muted" />
              )}
              <div className="space-y-px">
                <div className="font-medium text-foreground flex gap-1 items-center">
                  {a.team_name} {renderPlacementBadges(a)}
                </div>
                <div className="text-xs text-muted-foreground">
                  wins:{a.wins} losses:{a.losses}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "home_team_score",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Home Score
              <ArrowUpDown />
            </Button>
          );
        },
      },
      {
        accessorKey: "away_team_score",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Away Score
              <ArrowUpDown />
            </Button>
          );
        },
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

    const columns = baseColumns.filter((col) => {
      if (!excludeFields) return true;

      return !(
        ("accessorKey" in col &&
          excludeFields.includes(col.accessorKey as keyof LeagueMatch)) ||
        (col.id && excludeFields.includes(col.id as keyof LeagueMatch))
      );
    });

    const table = useReactTable({
      data: data,
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
        {label && (
          <div className="">
            <span className="font-semibold text-sm">{label}</span>
          </div>
        )}
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
                    {isLoading ? "Loading..." : "No data."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {controlls && (
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <DataTablePagination showPageSize={false} table={table} />
            </div>
            <Button variant={"outline"} size={"sm"} onClick={handleRefresh}>
              Refresh
            </Button>
          </div>
        )}
      </div>
    );
  }
);

export default LeagueMatchStaticDisplayTable;
