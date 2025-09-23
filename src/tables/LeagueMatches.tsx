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
import { useLeagueMatch } from "@/hooks/leagueMatch";
import type { LeagueMatch } from "@/types/leagueMatch";

type Props = {
  leagueCategoryId?: string;
  roundId?: string;
};

export function LeagueMatchesTable({ leagueCategoryId, roundId }: Props) {
  const { leagueMatchData, leagueMatchLoading, leagueMatchError } =
    useLeagueMatch(leagueCategoryId, roundId);

  const columns: ColumnDef<LeagueMatch>[] = [
    {
      accessorKey: "home-team",
      header: "Home Team",
      cell: ({ row }) => {
        const { home_team } = row.original;
        return (
          <div className="flex items-center gap-2">
            <img
              src={home_team!.team_logo_url}
              alt={home_team!.team_name}
              className="h-8 w-8 rounded-sm object-cover"
            />
            <span>{home_team!.team_name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "away-team",
      header: "Away Team",
      cell: ({ row }) => {
        const { away_team } = row.original;
        return (
          <div className="flex items-center gap-2">
            <img
              src={away_team!.team_logo_url}
              alt={away_team!.team_name}
              className="h-8 w-8 rounded-sm object-cover"
            />
            <span>{away_team!.team_name}</span>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: leagueMatchData ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
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
  );
}
