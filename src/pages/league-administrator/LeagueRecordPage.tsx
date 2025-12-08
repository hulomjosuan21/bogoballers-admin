import { memo, Suspense, useState } from "react";
import LeagueHistoryTable from "@/tables/LeagueHistoryTable";
import { Spinner } from "@/components/ui/spinner";
import { useToggleLeagueHistorySection } from "@/stores/leagueHistoryStore";
import { ToggleState } from "@/stores/toggleStore";
import { Button } from "@/components/ui/button";
import { formatDate12h } from "@/lib/app_utils";
import { toast } from "sonner";
import {
  printMatchScorebook,
  printMultipleMatches,
} from "@/components/pdf/MatchScorebookPdf";
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
import { ArrowUpDown, ChevronLeft, Printer, Search } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LeagueRecord } from "@/types/leagueRecord";
import { PDFViewer } from "@react-pdf/renderer";
import ActivityDesignDocument from "@/components/pdf/LeaguePdf";
import type { League } from "@/types/league";
import { useAuthLeagueAdmin } from "@/hooks/useAuth";
import { DataTablePagination } from "@/components/data-table-pagination";
import type { LeagueAdministator } from "@/types/leagueAdmin";
import LeagueReportDocument from "@/components/pdf/LeagueReport";

export const columns: ColumnDef<LeagueRecord>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "record_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Record Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("record_name")}</div>
    ),
  },
  {
    id: "matchup",
    header: "Matchup",
    accessorFn: (row) => `${row.home_team} vs ${row.away_team}`,
    cell: ({ row }) => (
      <div>
        <span className="font-bold">{row.original.home_team}</span>
        <span className="text-muted-foreground mx-2">vs</span>
        <span className="font-bold">{row.original.away_team}</span>
      </div>
    ),
  },
  {
    accessorKey: "schedule_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div>{formatDate12h(row.getValue("schedule_date"))}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const rec = row.original;

      return (
        <div className="text-right">
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
            onClick={(e) => {
              e.preventDefault();
              toast.promise(printMatchScorebook(rec.record_json), {
                loading: "Generating Scorebook PDF...",
                success: "PDF opened in new tab!",
                error: "Failed to generate PDF",
              });
            }}
          >
            <Printer size={14} />
            Print
          </Button>
        </div>
      );
    },
  },
];

const LeaguePdf = memo(
  ({
    leagueHistory,
    leagueAdmin,
  }: {
    leagueHistory: League;
    leagueAdmin: LeagueAdministator;
  }) => {
    return (
      <PDFViewer
        width="100%"
        height="900px"
        className="rounded-md shadow-sm"
        showToolbar={true}
      >
        <ActivityDesignDocument
          league={leagueHistory}
          leagueAdmin={leagueAdmin}
        />
      </PDFViewer>
    );
  }
);

const LeaguePdfReport = memo(
  ({
    league,
    leagueAdmin,
  }: {
    league: League;
    leagueAdmin: LeagueAdministator;
  }) => {
    return (
      <PDFViewer
        width="100%"
        height="900px"
        className="rounded-md shadow-sm"
        showToolbar={true}
      >
        <LeagueReportDocument league={league} leagueAdmin={leagueAdmin} />
      </PDFViewer>
    );
  }
);

export function LeaguesTabContent() {
  const { state, data: leagueHistory, reset } = useToggleLeagueHistorySection();
  const { leagueAdmin } = useAuthLeagueAdmin();

  const records: LeagueRecord[] = leagueHistory?.league_match_records ?? [];
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: records,
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

  const handleBatchPrint = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const rowsToPrint =
      selectedRows.length > 0 ? selectedRows : table.getFilteredRowModel().rows;
    const matchBooks = rowsToPrint.map((row) => row.original.record_json);

    if (matchBooks.length === 0) {
      toast.error("No records available to print.");
      return;
    }
    printMultipleMatches(matchBooks);
    table.resetRowSelection();
  };

  return (
    <Suspense
      key="league-history"
      fallback={
        <div className="h-40 grid place-content-center">
          <Spinner />
        </div>
      }
    >
      {state === ToggleState.SHOW_LEAGUE ? (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={reset}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {leagueHistory?.league_title ?? "League Matches Records"}
              </h2>
            </div>
          </div>
          <div className="flex-1 overflow-hidden p-2 relative">
            <Suspense
              fallback={
                <div className="h-40 grid place-content-center">
                  <Spinner />
                </div>
              }
            >
              <LeaguePdf
                leagueAdmin={leagueAdmin!}
                leagueHistory={leagueHistory as League}
              />
            </Suspense>
          </div>
          <div className="flex-1 overflow-hidden p-2 relative">
            <Suspense
              fallback={
                <div className="h-40 grid place-content-center">
                  <Spinner />
                </div>
              }
            >
              <LeaguePdfReport
                leagueAdmin={leagueAdmin!}
                league={leagueHistory as League}
              />
            </Suspense>
          </div>
          <div className="flex items-between gap-2 py-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter matches..."
                value={
                  (table.getColumn("matchup")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("matchup")?.setFilterValue(event.target.value)
                }
                className="pl-8"
              />
            </div>

            <Button
              variant={
                Object.keys(rowSelection).length > 0 ? "primary" : "secondary"
              }
              onClick={handleBatchPrint}
              disabled={!(Object.keys(rowSelection).length > 0)}
            >
              {Object.keys(rowSelection).length > 0
                ? `Print Selected (${Object.keys(rowSelection).length})`
                : "Print Selected (0)"}
            </Button>
          </div>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-muted">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
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
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DataTablePagination showPageSize={true} table={table} />
        </section>
      ) : (
        <LeagueHistoryTable />
      )}
    </Suspense>
  );
}
