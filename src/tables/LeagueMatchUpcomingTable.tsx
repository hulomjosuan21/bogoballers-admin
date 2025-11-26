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
import { Button } from "@/components/ui/button";
import type { LeagueMatch } from "@/types/leagueMatch";
import { MoreVertical, X } from "lucide-react";
import { formatDate12h } from "@/lib/app_utils";
import { memo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteSavedState,
  listSavedStates,
  type GameState,
} from "@/service/secureStore";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useToggleMatchBookSection,
  useToggleUpcomingMatchSection,
} from "@/stores/matchStore";
import { ToggleState } from "@/stores/toggleStore";

import type {
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTablePagination } from "@/components/data-table-pagination";
import { getErrorMessage } from "@/lib/error";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
} from "@/components/ui/alert";
import { RiErrorWarningFill } from "@remixicon/react";
import { useSelectedMatchStore } from "@/stores/selectedMatchStore";
import { printMatchScorebook } from "@/components/pdf/MatchScorebookPdf";

type SavedMatchItem = { matchId: string; state: GameState };

type Props = {
  leagueMatchData: LeagueMatch[];
  leagueMatchLoading: boolean;
  refetchLeagueMatch: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<LeagueMatch[] | null, Error>>;
};

export function CustomDataTable<T>({
  data,
  columns,
  empty,
  loading = false,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  empty?: string;
  loading?: boolean;
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="bg-muted/50">
              {hg.headers.map((header) => (
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
          {table.getRowModel().rows.length ? (
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
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted"
              >
                {empty ?? "No data"}
                {loading ?? "Loading data..."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function MainTable({
  leagueMatchData,
  leagueMatchLoading,
  refetchLeagueMatch,
}: Props) {
  const navigate = useNavigate();
  const { toggle: toggleMatchBook } = useToggleMatchBookSection();

  const [matches, setMatches] = useState<LeagueMatch[]>([]);
  const { selectedMatch, setSelectedMatch, removeSelectedMatch } =
    useSelectedMatchStore();

  const [savedMatches, setSavedMatches] = useState<SavedMatchItem[]>([]);
  const { toggle: toggleUpcomingMatch } = useToggleUpcomingMatchSection();

  useEffect(() => {
    const load = async () => setSavedMatches(await listSavedStates());
    load();
  }, []);

  useEffect(() => {
    if (leagueMatchData) {
      setMatches(
        leagueMatchData.filter(
          (m) =>
            !savedMatches.some((s) => s.matchId === m.league_match_id) &&
            m.league_match_id !== selectedMatch?.league_match_id // exclude selected
        )
      );
    }
  }, [leagueMatchData, savedMatches, selectedMatch]);

  const handleSelectMatch = (match: LeagueMatch) => {
    setSelectedMatch(match);
    setMatches((prev) =>
      prev.filter(
        (m) => m.public_league_match_id !== match.public_league_match_id
      )
    );
  };

  const handleRemoveSaved = async (matchId: string) => {
    await deleteSavedState(matchId);
    setSavedMatches((prev) => prev.filter((m) => m.matchId !== matchId));
  };

  const handleContinue = (matchId: string) => navigate(`/scorebook/${matchId}`);

  const handleRefresh = async () => {
    toast.promise(refetchLeagueMatch(), {
      loading: "Loading...",
      success: "Done",
      error: (e) => getErrorMessage(e),
    });
  };

  const upcomingColumns: ColumnDef<LeagueMatch>[] = [
    {
      header: "Home Team",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <img
            src={row.original.home_team!.team_logo_url}
            className="h-8 w-8 rounded-sm object-cover"
          />
          <span>{row.original.home_team!.team_name}</span>
        </div>
      ),
    },
    {
      header: "Away Team",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <img
            src={row.original.away_team!.team_logo_url}
            className="h-8 w-8 rounded-sm object-cover"
          />
          <span>{row.original.away_team!.team_name}</span>
        </div>
      ),
    },
    {
      header: "Schedule",
      cell: ({ row }) => (
        <span>{formatDate12h(row.original.scheduled_date!)}</span>
      ),
    },
    {
      header: "Format",
      cell: ({ row }) =>
        row.original.quarters && row.original.minutes_per_quarter ? (
          `${row.original.quarters}Q @ ${row.original.minutes_per_quarter}m`
        ) : (
          <Badge variant="outline" className="gap-1">
            <X size={12} className="text-red-500" /> Not Set
          </Badge>
        ),
    },
    { accessorKey: "display_name", header: "Detail" },
    {
      id: "actions",
      cell: ({ row }) => {
        const m = row.original;

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleSelectMatch(row.original)}
                >
                  Select
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    toggleUpcomingMatch(m, ToggleState.CONFIG_UPCOMING)
                  }
                >
                  Setup
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const savedColumns: ColumnDef<SavedMatchItem>[] = [
    {
      header: "Continue",
      cell: ({ row }) =>
        `${row.original.state.present.home_team.team_name} vs ${row.original.state.present.away_team.team_name}`,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleContinue(row.original.matchId)}
              >
                Continue
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  toast.promise(
                    printMatchScorebook(row.original.state.present),
                    {
                      loading: "Generating Scorebook PDF...",
                      success: "PDF opened in new tab!",
                      error: "Failed to generate PDF",
                    }
                  );
                }}
              >
                Print
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  toggleMatchBook(
                    row.original.state.present,
                    ToggleState.SHOW_SAVED_MATCH
                  )
                }
              >
                Finalize
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-red-600 hover:text-red-700">
                Danger
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleRemoveSaved(row.original.matchId)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <SelectedMatchAlert
        match={selectedMatch}
        onRemove={() => {
          if (selectedMatch) {
            setMatches((prev) => [...prev, selectedMatch]);
          }
          removeSelectedMatch();
        }}
      />

      {savedMatches.length > 0 && (
        <CustomDataTable data={savedMatches} columns={savedColumns} />
      )}

      <span className="text-sm font-medium">Upcoming Matches</span>
      <div className="space-y-2">
        <CustomDataTable
          data={matches}
          columns={upcomingColumns}
          empty={leagueMatchLoading ? "Loading..." : "No upcoming matches"}
        />

        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <DataTablePagination
              showPageSize={true}
              table={useReactTable({
                data: matches,
                columns: upcomingColumns,
                getCoreRowModel: getCoreRowModel(),
              })}
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}

const ScheduleMatchTable = memo(MainTable);
export default ScheduleMatchTable;

export function SelectedMatchAlert({
  match,
  onRemove,
  onOtherPage = false,
}: {
  match: LeagueMatch | null;
  onRemove: () => void;
  onOtherPage?: boolean;
}) {
  const { toggle: toggleUpcomingMatch } = useToggleUpcomingMatchSection();
  const navigate = useNavigate();

  if (!match) {
    return (
      <Alert variant="warning" close={false}>
        <AlertIcon>
          <RiErrorWarningFill />
        </AlertIcon>
        <AlertTitle>No match selected</AlertTitle>
      </Alert>
    );
  }
  const handleSetup = () => {
    toggleUpcomingMatch(match, ToggleState.CONFIG_UPCOMING);
    if (onOtherPage) {
      navigate("/portal/league-administrator/pages/league-matches");
    }
  };

  return (
    <Alert variant="info" close={true} onClose={onRemove}>
      <AlertIcon>
        <RiErrorWarningFill />
      </AlertIcon>
      <AlertTitle>
        {match.home_team?.team_name} vs {match.away_team?.team_name}
      </AlertTitle>
      <AlertToolbar>
        <Button
          variant="inverse"
          mode="link"
          underlined="solid"
          size="sm"
          className="flex mt-0.5"
          onClick={handleSetup}
        >
          Setup
        </Button>
      </AlertToolbar>
    </Alert>
  );
}
