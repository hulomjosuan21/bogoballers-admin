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
} from "@/components/ui/table";
import type { MatchBook } from "@/types/scorebook";
import { Input } from "@/components/ui/input";

const mockMatch: Partial<MatchBook> = {
  qtr: [
    { "1qtr": true },
    { "2qtr": true },
    { "3qtr": true },
    { "4qtr": false },
  ],
};

type Props = {
  viewMode?: boolean;
};

export function TeamDataPerQuarterTable({ viewMode = false }: Props) {
  const { qtr } = mockMatch;

  const columns: ColumnDef<{ [key: string]: boolean }>[] = [
    {
      accessorFn: (row) => Object.keys(row)[0],
      header: "Quarter",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "team-foul",
      header: "Team fouls",
      cell: () => (
        <div className="flex-[0_0_auto] w-fit">
          <Input
            type="number"
            className="rounded-sm w-12 remove-spinner"
            variant={"sm"}
            readOnly={viewMode}
          />
        </div>
      ),
    },
    {
      accessorKey: "score",
      header: "Score",
      cell: () => <span>0</span>,
    },
  ];

  const table = useReactTable({
    data: qtr!,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows.slice(0, 5);

  return (
    <div className="">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted text-xs p-0">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="py-0 h-8">
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
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-1">
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
