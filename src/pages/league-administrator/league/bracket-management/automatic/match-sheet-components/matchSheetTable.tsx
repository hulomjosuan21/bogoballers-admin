import {
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
import { useSuspenseQuery } from "@tanstack/react-query";
import { matchColumns, type MatchData } from "./matchSheetColumn";
import axiosClient from "@/lib/axiosClient";
import { DataTablePagination } from "@/components/data-table-pagination";
import { getPaginationRowModel } from "@tanstack/react-table";

interface MatchesTableProps {
  roundId: string;
}

export function AutomaticMatchesTable({ roundId }: MatchesTableProps) {
  const { data } = useSuspenseQuery({
    queryKey: ["round-matches", roundId],
    queryFn: async () => {
      const res = await axiosClient.get<MatchData[]>(
        `/auto-match-config/round-matches/${roundId}`
      );
      return res.data;
    },
  });
  const table = useReactTable({
    data,
    columns: matchColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-2">
      <div className="rounded-md border">
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
                  colSpan={matchColumns.length}
                  className="h-24 text-center"
                >
                  No matches found in this round.
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
