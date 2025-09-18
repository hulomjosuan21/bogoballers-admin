import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
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
import { CheckIcon, X } from "lucide-react";
import { formatDate12h } from "@/lib/app_utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  leagueCategoryId?: string;
  roundId?: string;
};

export function FinishedMatchTable({ leagueCategoryId, roundId }: Props) {
  const { leagueMatchData, leagueMatchLoading, leagueMatchError } =
    useLeagueMatch(leagueCategoryId, roundId, {
      condition: "Completed",
    });

  const columns: ColumnDef<LeagueMatch>[] = [
    {
      accessorKey: "home-team",
      header: "Home Team",
      cell: ({ row }) => {
        const { home_team } = row.original;
        return (
          <div className="flex items-center gap-2">
            <img
              src={home_team.team_logo_url}
              alt={home_team.team_name}
              className="h-8 w-8 rounded-sm object-cover"
            />
            <span>{home_team.team_name}</span>
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
              src={away_team.team_logo_url}
              alt={away_team.team_name}
              className="h-8 w-8 rounded-sm object-cover"
            />
            <span>{away_team.team_name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "score",
      header: "Score",
      cell: ({ row }) => {
        const { home_team_score, away_team_score } = row.original;
        return home_team_score != null && away_team_score != null
          ? `${home_team_score} - ${away_team_score}`
          : "N/A";
      },
    },
    {
      accessorKey: "court",
      header: "Court",
      cell: ({ row }) =>
        row.original.court || (
          <Badge variant="outline" className="gap-1">
            <X className="text-red-500" size={12} aria-hidden="true" />
            Not Set
          </Badge>
        ),
    },
    {
      accessorKey: "scheduled_date",
      header: "Date",
      cell: ({ row }) => (
        <span>{formatDate12h(row.original.scheduled_date!)}</span>
      ),
    },
    {
      accessorKey: "details",
      header: "Format",
      cell: ({ row }) => {
        const { quarters, minutes_per_quarter } = row.original;
        return quarters && minutes_per_quarter ? (
          `${quarters}Q @ ${minutes_per_quarter}m`
        ) : (
          <Badge variant="outline" className="gap-1">
            <X className="text-red-500" size={12} aria-hidden="true" />
            Not Set
          </Badge>
        );
      },
    },
    {
      accessorKey: "referees",
      header: "Referees",
      cell: ({ row }) => {
        const referees = row.original.referees;
        return (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="cursor-help gap-1">
                  <CheckIcon
                    className="text-emerald-500"
                    size={12}
                    aria-hidden="true"
                  />
                  {referees.length} Set
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="py-3 max-w-xs">
                <p className="text-[13px] font-medium mb-1">Match Referees:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs text-muted-foreground">
                  {referees.map((ref, idx) => (
                    <li key={idx}>{ref}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="default" className="capitalize">
          {row.original.status}
        </Badge>
      ),
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
