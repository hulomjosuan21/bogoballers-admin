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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToggleMatchBookSection } from "@/stores/matchStore";
import { ToggleState } from "@/stores/toggleStore";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/datetime-picker";
import { Input } from "@/components/ui/input";
import MultipleSelector from "@/components/ui/multiselect";
import { LeagueMatchService } from "@/service/leagueMatchService";
import type {
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { LeagueCourt, LeagueReferee } from "@/types/league";
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

type SavedMatchItem = { matchId: string; state: GameState };

type SheetFormData = {
  scheduled_date?: Date;
  court?: string;
  referees?: { label: string; value: string }[];
  quarters?: number;
  minutes_per_quarter?: number;
  home_team_score?: number;
  away_team_score?: number;
  winner_team_id?: string;
  status?: string;
  minutes_per_overtime?: number;
};

type Props = {
  leagueMatchData: LeagueMatch[];
  leagueMatchLoading: boolean;
  refetchLeagueMatch: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<LeagueMatch[] | null, Error>>;
  refereesOption: LeagueReferee[];
  courtOption: LeagueCourt[];
};

function DataTable<T>({
  data,
  columns,
  empty,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  empty?: string;
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
  refereesOption,
  courtOption,
}: Props) {
  const navigate = useNavigate();
  const { toggle } = useToggleMatchBookSection();

  const [matches, setMatches] = useState<LeagueMatch[]>([]);
  const { selectedMatch, setSelectedMatch, removeSelectedMatch } =
    useSelectedMatchStore();

  const [editingMatch, setEditingMatch] = useState<LeagueMatch | null>(null);
  const [savedMatches, setSavedMatches] = useState<SavedMatchItem[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetFormData, setSheetFormData] = useState<SheetFormData>({});

  const handleFormChange = (field: keyof SheetFormData, value: any) => {
    setSheetFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const load = async () => setSavedMatches(await listSavedStates());
    load();
  }, []);

  useEffect(() => {
    if (leagueMatchData) {
      setMatches(
        leagueMatchData.filter(
          (m) => !savedMatches.some((s) => s.matchId === m.league_match_id)
        )
      );
    }
  }, [leagueMatchData, savedMatches]);

  const initForm = (match: LeagueMatch): SheetFormData => ({
    scheduled_date: match.scheduled_date
      ? new Date(match.scheduled_date)
      : undefined,
    court: match.court || "",
    quarters: match.quarters,
    minutes_per_quarter: match.minutes_per_quarter,
    minutes_per_overtime: match.minutes_per_overtime,
    referees: match.referees?.map((r) => ({ label: r, value: r })) ?? [],
  });

  const handleSelectMatch = (match: LeagueMatch) => {
    if (selectedMatch) setMatches((prev) => [...prev, selectedMatch]);
    setSelectedMatch(match);
    setMatches((prev) =>
      prev.filter(
        (m) => m.public_league_match_id !== match.public_league_match_id
      )
    );
    setSheetFormData(initForm(match));
  };

  const handleConfigureMatch = (match: LeagueMatch) => {
    setEditingMatch(match);
    setSheetFormData(initForm(match));
    setIsSheetOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!editingMatch) return;
    try {
      await LeagueMatchService.updateOne(editingMatch.league_match_id, {
        ...sheetFormData,
        referees: sheetFormData.referees?.map((r) => r.value),
        scheduled_date: sheetFormData.scheduled_date?.toISOString(),
      });
      await refetchLeagueMatch();
      setIsSheetOpen(false);
      toast.success("Update successful");
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    }
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
    { accessorKey: "display_name", header: "Group" },
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
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => handleSelectMatch(row.original)}
                >
                  Select
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleConfigureMatch(row.original)}
                >
                  Configure
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const savedColumns: ColumnDef<SavedMatchItem>[] = [
    {
      header: "Match",
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
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => handleContinue(row.original.matchId)}
                >
                  Continue
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleRemoveSaved(row.original.matchId)}
                >
                  Remove
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    toggle(
                      row.original.state.present,
                      ToggleState.SHOW_SAVED_MATCH
                    )
                  }
                >
                  Finalize
                </DropdownMenuItem>
              </DropdownMenuGroup>
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

      <span className="text-sm font-medium">Continue Matches</span>
      <DataTable data={savedMatches} columns={savedColumns} />

      <span className="text-sm font-medium">Upcoming Matches</span>
      <div className="space-y-2">
        <DataTable
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

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Manage Match</SheetTitle>
            <SheetDescription>
              Update match details or set the final schedule.
            </SheetDescription>
          </SheetHeader>

          <div className="grid space-y-4">
            <div>
              <Label>Schedule Date & Time</Label>
              <DateTimePicker
                dateTime={sheetFormData.scheduled_date}
                setDateTime={(date) => handleFormChange("scheduled_date", date)}
              />
            </div>

            <div>
              <Label>Court</Label>
              <Select
                value={sheetFormData.court}
                onValueChange={(value) => handleFormChange("court", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Court" />
                </SelectTrigger>
                <SelectContent>
                  {courtOption.map((court) => (
                    <SelectItem key={court.name} value={court.name}>
                      {court.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div>
                <Label>Quarters</Label>
                <Input
                  type="number"
                  value={sheetFormData.quarters ?? ""}
                  onChange={(e) =>
                    handleFormChange("quarters", e.target.valueAsNumber)
                  }
                />
              </div>
              <div>
                <Label>Minutes per Quarter</Label>
                <Input
                  type="number"
                  value={sheetFormData.minutes_per_quarter ?? ""}
                  onChange={(e) =>
                    handleFormChange(
                      "minutes_per_quarter",
                      e.target.valueAsNumber
                    )
                  }
                />
              </div>
              <div>
                <Label>Minutes per Overtime</Label>
                <Input
                  type="number"
                  value={sheetFormData.minutes_per_overtime ?? ""}
                  onChange={(e) =>
                    handleFormChange(
                      "minutes_per_overtime",
                      e.target.valueAsNumber
                    )
                  }
                />
              </div>
            </div>

            <div>
              <Label>Referees</Label>
              <MultipleSelector
                maxSelected={3}
                value={sheetFormData.referees ?? []}
                onChange={(value) => handleFormChange("referees", value)}
                options={refereesOption.map((ref) => ({
                  label: ref.full_name,
                  value: ref.full_name,
                }))}
                placeholder="Select referees..."
              />
            </div>
          </div>

          <SheetFooter className="mt-auto">
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

const ScheduleMatchTable = memo(MainTable);
export default ScheduleMatchTable;

export function SelectedMatchAlert({
  match,
  onRemove,
}: {
  match: LeagueMatch | null;
  onRemove: () => void;
}) {
  const navigate = useNavigate();

  const handleStart = () => {
    if (match) navigate(`/scorebook/${match.league_match_id}`);
  };

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
          onClick={handleStart}
        >
          Start
        </Button>
      </AlertToolbar>
    </Alert>
  );
}
