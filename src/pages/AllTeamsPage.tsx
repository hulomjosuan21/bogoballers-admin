import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
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
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { getAllTeamsQueryOptions } from "@/queries/teamQueryOptions";
import type { Team } from "@/types/team";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Copy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AllTeamsPage() {
  const { data, isLoading, error } = useQuery(getAllTeamsQueryOptions);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const columns: ColumnDef<Team>[] = [
    {
      accessorKey: "team_id",
      header: "TeamId",
      cell: ({ row }) => {
        const value = row.getValue("team_id") as string;
        const masked = value ? value.slice(0, 6) + "..." : "";

        const copyToClipboard = () => {
          navigator.clipboard.writeText(value);
        };

        return (
          <div className="flex items-center gap-2">
            <span className="font-mono">{masked}</span>
            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "user_id",
      header: "UserId",
      cell: ({ row }) => {
        const value = row.getValue("user_id") as string;
        const masked = value ? value.slice(0, 6) + "..." : "";

        const copyToClipboard = () => {
          navigator.clipboard.writeText(value);
        };

        return (
          <div className="flex items-center gap-2">
            <span className="font-mono">{masked}</span>
            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span>{row.original.creator.email}</span>,
    },
    {
      accessorKey: "contact_number",
      header: "Contact #",
      cell: ({ row }) => <span>{row.original.creator.contact_number}</span>,
    },
    {
      accessorKey: "team_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Team mame
          <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const value = row.original.team_logo_url;
        const name = row.original.team_name;
        return (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage
                className="object-cover rounded-sm"
                src={
                  typeof value === "string" ? value : URL.createObjectURL(value)
                }
                alt={name}
              />
              <AvatarFallback className="rounded-sm">
                {name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "players",
      header: "Total players",
      cell: ({ row }) => <span>{row.original.accepted_players.length}</span>,
    },
    {
      accessorKey: "coach_name",
      header: "Coach",
    },
    {
      accessorKey: "assistant_coach_name",
      header: "Assistant coach",
    },
  ];

  const table = useReactTable({
    data: data ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
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
    <div className="space-y-2 p-4">
      <div className="flex items-center">
        <Input
          placeholder="Search teams..."
          value={table.getState().globalFilter ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="bg-muted">
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
                  {isLoading ? "Loading..." : error ? error.message : "No Data"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* <DataTablePagination showPageSize={false} table={table} /> */}
    </div>
  );
}
