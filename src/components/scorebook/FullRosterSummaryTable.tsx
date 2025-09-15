import type { PlayerBook, TeamBook } from "@/types/scorebook";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type Props = {
  team: TeamBook;
};

const formatPercentage = (made: number, attempted: number): string => {
  if (attempted === 0) return "0.0%";
  return ((made / attempted) * 100).toFixed(1) + "%";
};

export function FullRosterSummaryTable({ team }: Props) {
  const columns: ColumnDef<PlayerBook>[] = [
    {
      header: "#",
      accessorKey: "jersey_number",
      cell: (info) => info.getValue(),
    },
    {
      header: "Player",
      accessorKey: "full_name",
      cell: (info) => info.getValue(),
    },
    {
      header: "PTS",
      accessorKey: "total_score",
      cell: (info) => (
        <span className="font-bold">{info.getValue() as number}</span>
      ),
    },
    {
      header: "REB",
      accessorKey: "summary.reb",
    },
    {
      header: "AST",
      accessorKey: "summary.ast",
    },
    {
      header: "STL",
      accessorKey: "summary.stl",
    },
    {
      header: "BLK",
      accessorKey: "summary.blk",
    },

    {
      header: "2PT%",
      cell: ({ row }) => {
        const { fg2m, fg2a } = row.original.summary;
        return formatPercentage(fg2m, fg2a);
      },
    },
    {
      header: "3PT%",
      cell: ({ row }) => {
        const { fg3m, fg3a } = row.original.summary;
        return formatPercentage(fg3m, fg3a);
      },
    },

    {
      header: "FT%",
      cell: ({ row }) => {
        const { ftm, fta } = row.original.summary;
        return formatPercentage(ftm, fta);
      },
    },
    {
      header: "PF",
      accessorKey: "P",
    },
  ];

  const table = useReactTable({
    data: team.players,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <h3 className="text-sm font-semibold p-3 bg-muted/50">
        Full Roster Summary
      </h3>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="h-9">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-2 text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
