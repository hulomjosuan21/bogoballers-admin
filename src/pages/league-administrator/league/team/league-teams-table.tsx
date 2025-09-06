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
import type { LeagueTeamForMatch } from "@/types/team";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllLeagueTeamForMatchQueryOption } from "@/queries/league_team";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreVertical } from "lucide-react";
import { ImageZoom } from "@/components/ui/kibo-ui/image-zoom";

type Props = {
  leagueId?: string;
  leagueCategoryId?: string;
  isLoading: boolean;
};

export const columns: ColumnDef<LeagueTeamForMatch>[] = [
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
    accessorKey: "league_players",
    header: "Players count",
    cell: ({ row }) => {
      const team = row.original;
      return <span>{team.league_players.length}</span>;
    },
  },
  {
    accessorKey: "wins",
    header: "Total wins",
  },
  {
    accessorKey: "points",
    header: "Total points",
  },
  {
    accessorKey: "losses",
    header: "Total losses",
  },
  {
    accessorKey: "draws",
    header: "Total draws",
  },
  {
    id: "actions",
    enableHiding: false,
    cell: () => {
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
              <DropdownMenuItem>Details</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Ban</DropdownMenuItem>
              <DropdownMenuItem>Remove</DropdownMenuItem>
              <DropdownMenuItem>Remove & Refund</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export default function LeagueTeamsTable({
  leagueId,
  leagueCategoryId,
  isLoading,
}: Props) {
  const { data } = useQuery(
    getAllLeagueTeamForMatchQueryOption({
      leagueCategoryId: leagueCategoryId,
      leagueId: leagueId,
    })
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: data ?? ([] as LeagueTeamForMatch[]),
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
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
