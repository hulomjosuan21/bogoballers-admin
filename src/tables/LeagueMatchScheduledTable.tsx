import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { CheckIcon, MoreVertical, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table-pagination";
import MultipleSelector from "@/components/ui/multiselect";
import { DateTimePicker } from "@/components/datetime-picker";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import type { LeagueCourt, LeagueReferee } from "@/types/league";
import { LeagueMatchService } from "@/service/leagueMatchService";
import { formatDate12h } from "@/lib/app_utils";
import type { LeagueMatch } from "@/types/leagueMatch";
import { useLeagueMatch } from "@/hooks/leagueMatch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/error";

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
  leagueCategoryId?: string;
  roundId?: string;
};

export function ScheduleMatchTable({ leagueCategoryId, roundId }: Props) {
  const { activeLeagueData } = useActiveLeague();

  const {
    leagueMatchData,
    leagueMatchLoading,
    leagueMatchError,
    refetchLeagueMatch,
  } = useLeagueMatch(leagueCategoryId, roundId, {
    condition: "Scheduled",
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const [refereesOption, setRefereesOption] = useState<LeagueReferee[]>([]);
  const [courtOption, setCourtOption] = useState<LeagueCourt[]>([]);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<LeagueMatch | null>(null);
  const [sheetFormData, setSheetFormData] = useState<SheetFormData>({});

  useEffect(() => {
    const referees = (activeLeagueData?.league_referees ?? []).filter(
      (ref) => ref.is_available
    );

    const courts = (activeLeagueData?.league_courts ?? []).filter(
      (court) => court.is_available
    );

    setRefereesOption(referees);
    setCourtOption(courts);
  }, [activeLeagueData]);

  useEffect(() => {
    if (selectedMatch) {
      setSheetFormData({
        court: selectedMatch.court || "",
        quarters: selectedMatch.quarters || undefined,
        minutes_per_quarter: selectedMatch.minutes_per_quarter || undefined,
        minutes_per_overtime: selectedMatch.minutes_per_overtime || undefined,
        scheduled_date: selectedMatch.scheduled_date
          ? new Date(selectedMatch.scheduled_date)
          : undefined,
        referees:
          selectedMatch.referees?.map((ref) => ({
            label: ref,
            value: ref,
          })) || [],
      });
    }
  }, [selectedMatch]);

  useEffect(() => {
    const homeScore = sheetFormData.home_team_score;
    const awayScore = sheetFormData.away_team_score;

    if (
      selectedMatch &&
      typeof homeScore === "number" &&
      !isNaN(homeScore) &&
      typeof awayScore === "number" &&
      !isNaN(awayScore)
    ) {
      setSheetFormData((prev) => {
        let newWinnerId: string | undefined = undefined;
        let newStatus = prev.status;

        if (homeScore > awayScore) {
          newWinnerId = selectedMatch.home_team_id!;
        } else if (awayScore > homeScore) {
          newWinnerId = selectedMatch.away_team_id!;
        } else {
          newWinnerId = undefined;
          if (newStatus === "Completed") newStatus = "Scheduled";
        }

        return { ...prev, winner_team_id: newWinnerId, status: newStatus };
      });
    } else {
      setSheetFormData((prev) => ({
        ...prev,
        winner_team_id: undefined,
        status: prev.status === "Completed" ? "Scheduled" : prev.status,
      }));
    }
  }, [
    sheetFormData.home_team_score,
    sheetFormData.away_team_score,
    selectedMatch,
  ]);

  const handleOpenSheet = (match: LeagueMatch) => {
    setSelectedMatch(match);
    setIsSheetOpen(true);
  };

  const handleFormChange = (field: keyof SheetFormData, value: any) => {
    setSheetFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = () => {
    if (!selectedMatch) return;

    const payload: Partial<LeagueMatch> = {
      court: sheetFormData.court,
      quarters: sheetFormData.quarters,
      minutes_per_quarter: sheetFormData.minutes_per_quarter,
      minutes_per_overtime: sheetFormData.minutes_per_overtime,
      referees: sheetFormData.referees?.map((opt) => opt.value),
      scheduled_date: sheetFormData.scheduled_date
        ? sheetFormData.scheduled_date.toISOString()
        : undefined,
    };

    const updateApi = async () => {
      await LeagueMatchService.updateOne(
        selectedMatch.league_match_id,
        payload
      );
      await refetchLeagueMatch();
      setIsSheetOpen(false);
    };

    toast.promise(updateApi(), {
      loading: "Saving changes...",
      success: "Update successful",
      error: (err) => err.message || "An error occurred.",
    });
  };

  function handleRefresh(): void {
    const refresh = async () => {
      await refetchLeagueMatch();
    };

    toast.promise(refresh(), {
      loading: "Loading...",
      success: "Done",
      error: (e) => getErrorMessage(e),
    });
  }

  const columns: ColumnDef<LeagueMatch>[] = [
    {
      accessorKey: "home-team",
      header: "Home team",
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
      header: "Away team",
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
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return <Badge variant="outline">{status}</Badge>;
      },
    },
    {
      accessorKey: "score",
      header: "Score",
      cell: ({ row }) => {
        const { home_team_score, away_team_score, status } = row.original;
        if (
          status !== "Completed" ||
          home_team_score === null ||
          away_team_score === null
        ) {
          return <span className="text-muted-foreground">--</span>;
        }
        return (
          <span className="font-mono font-medium">{`${home_team_score} - ${away_team_score}`}</span>
        );
      },
    },
    {
      accessorKey: "winner_team_id",
      header: "Winner",
      cell: ({ row }) => {
        const { winner_team_id, home_team, away_team } = row.original;
        if (!winner_team_id) {
          return <span className="text-muted-foreground">--</span>;
        }
        const winner =
          winner_team_id === home_team!.team_id ? home_team : away_team;
        return (
          <div className="flex items-center gap-2 font-medium">
            <img
              src={winner!.team_logo_url}
              alt={winner!.team_name}
              className="h-6 w-6 rounded-sm object-cover"
            />
            <span>{winner!.team_name}</span>
          </div>
        );
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
      accessorKey: "details",
      header: "Format",
      cell: ({ row }) => {
        const { quarters, minutes_per_quarter } = row.original;
        return quarters && minutes_per_quarter ? (
          <span>
            {quarters}Q @ {minutes_per_quarter}m
          </span>
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
        const { referees } = row.original;
        if (!referees || referees.length === 0) {
          return (
            <Badge variant="outline" className="gap-1">
              <X className="text-red-500" size={12} aria-hidden="true" />
              Not Set
            </Badge>
          );
        }
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
      accessorKey: "display_name",
      header: "Group",
    },
    {
      accessorKey: "scheduled_date",
      header: "Scheduled date",
      cell: ({ row }) => (
        <span>{formatDate12h(row.original.scheduled_date!)}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => handleOpenSheet(row.original)}
          >
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: leagueMatchData ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
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
                  {leagueMatchLoading
                    ? "Loading data..."
                    : leagueMatchError
                    ? leagueMatchError.message
                    : "No data"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <DataTablePagination showPageSize={true} table={table} />
        </div>
        <Button variant={"outline"} size={"sm"} onClick={handleRefresh}>
          Refresh
        </Button>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent aria-describedby={undefined}>
          <SheetHeader>
            <SheetTitle>Manage Match</SheetTitle>
            <SheetDescription>
              Update match details or set the final schedule. Click the
              appropriate save button below.
            </SheetDescription>
          </SheetHeader>
          <div className="grid space-y-4">
            <div className="space-y-1">
              <Label htmlFor="scheduled_date">Schedule Date & Time</Label>
              <DateTimePicker
                dateTime={sheetFormData.scheduled_date}
                setDateTime={(date) => handleFormChange("scheduled_date", date)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="court">Court</Label>
              <Select
                value={sheetFormData.court}
                onValueChange={(value) => handleFormChange("court", value)}
              >
                <SelectTrigger id="court">
                  <SelectValue placeholder="Select Court" />
                </SelectTrigger>
                <SelectContent>
                  {courtOption.map((court, index) => (
                    <SelectItem key={index} value={court.name}>
                      {court.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="quarters">Quarters</Label>
                <Input
                  type="number"
                  id="quarters"
                  placeholder="e.g., 4"
                  value={sheetFormData.quarters || ""}
                  onChange={(e) =>
                    handleFormChange("quarters", e.target.valueAsNumber)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="minutes_per_quarter">Minutes per Quarter</Label>
                <Input
                  type="number"
                  placeholder="e.g., 10"
                  id="minutes_per_quarter"
                  value={sheetFormData.minutes_per_quarter || ""}
                  onChange={(e) =>
                    handleFormChange(
                      "minutes_per_quarter",
                      e.target.valueAsNumber
                    )
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="minutes_per_overtime">
                  Minutes per overtime
                </Label>
                <Input
                  type="number"
                  placeholder="e.g., 10"
                  id="minutes_per_overtime"
                  value={sheetFormData.minutes_per_overtime || ""}
                  onChange={(e) =>
                    handleFormChange(
                      "minutes_per_overtime",
                      e.target.valueAsNumber
                    )
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <MultipleSelector
                maxSelected={3}
                hidePlaceholderWhenSelected
                value={sheetFormData.referees || []}
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
