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
import { memo, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { LeagueCourt, LeagueReferee } from "@/types/league";
import { LeagueMatchService } from "@/service/leagueMatchService";
import { getErrorMessage } from "@/lib/error";
import {
  useMutation,
  type QueryObserverResult,
  type RefetchOptions,
} from "@tanstack/react-query";
import { useLeagueStore } from "@/stores/leagueStore";
import type { LeagueMatch } from "@/types/leagueMatch";
import { ManualScoreDialog } from "@/dialogs/manualScoreDialog";

type SheetFormData = {
  scheduled_date?: Date;
  court?: string;
  referees?: { label: string; value: string }[];
  quarters?: number;
  minutes_per_quarter?: number;
  minutes_per_overtime?: number;
};

// Simplified state just for opening the dialog and tracking which match
type ScoreDialogState = {
  isOpen: boolean;
  match: Partial<LeagueMatch> | null;
};

type Props = {
  leagueCategoryId?: string;
  roundId?: string;
  leagueMatchData: Partial<LeagueMatch>[] | null | undefined;
  leagueMatchLoading: boolean;
  leagueMatchError: Error | null;
  refetchLeagueMatch: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<Partial<LeagueMatch>[] | null, Error>>;
};

function UnscheduleTable({
  leagueMatchData,
  leagueMatchLoading,
  leagueMatchError,
  refetchLeagueMatch,
}: Props) {
  const { league: activeLeagueData } = useLeagueStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [refereesOption, setRefereesOption] = useState<LeagueReferee[]>([]);
  const [courtOption, setCourtOption] = useState<LeagueCourt[]>([]);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] =
    useState<Partial<LeagueMatch> | null>(null);
  const [sheetFormData, setSheetFormData] = useState<SheetFormData>({});
  const [scoreDialog, setScoreDialog] = useState<ScoreDialogState>({
    isOpen: false,
    match: null,
  });

  const toLocalISOString = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset)
      .toISOString()
      .slice(0, -1);
    return localISOTime;
  };

  const saveChangesMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Partial<LeagueMatch>>;
    }) => LeagueMatchService.updateOne(id, payload),
    onSuccess: async () => {
      toast.success("Match details updated successfully");
      await refetchLeagueMatch();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error) || "Failed to save changes"),
  });

  const scheduleMatchMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Partial<LeagueMatch>>;
    }) => LeagueMatchService.updateOne(id, payload),
    onSuccess: async () => {
      toast.success("Match Scheduled Successfully");
      setIsSheetOpen(false);
      await refetchLeagueMatch();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error) || "Failed to schedule match"),
  });

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

  const handleOpenSheet = (match: Partial<LeagueMatch>) => {
    setSelectedMatch(match);
    setIsSheetOpen(true);
  };

  const handleFormChange = (field: keyof SheetFormData, value: any) => {
    setSheetFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = () => {
    if (!selectedMatch) return;
    const payload: Partial<Partial<LeagueMatch>> = {
      court: sheetFormData.court,
      quarters: sheetFormData.quarters,
      minutes_per_quarter: sheetFormData.minutes_per_quarter,
      minutes_per_overtime: sheetFormData.minutes_per_overtime,
      referees: sheetFormData.referees?.map((opt) => opt.value),
      scheduled_date: sheetFormData.scheduled_date
        ? sheetFormData.scheduled_date.toISOString()
        : undefined,
    };
    saveChangesMutation.mutate({
      id: selectedMatch.league_match_id!,
      payload,
    });
  };

  const handleSaveSchedule = () => {
    if (!selectedMatch) return;
    if (!sheetFormData.scheduled_date) {
      toast.error("Please select a date and time to schedule the match.");
      return;
    }
    const payload: Partial<Partial<LeagueMatch>> = {
      court: sheetFormData.court,
      quarters: sheetFormData.quarters,
      minutes_per_quarter: sheetFormData.minutes_per_quarter,
      minutes_per_overtime: sheetFormData.minutes_per_overtime,
      referees: sheetFormData.referees?.map((opt) => opt.value),
      scheduled_date: toLocalISOString(sheetFormData.scheduled_date),
      status: "Scheduled",
    };
    scheduleMatchMutation.mutate({
      id: selectedMatch.league_match_id!,
      payload,
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

  const columns: ColumnDef<Partial<LeagueMatch>>[] = [
    {
      accessorKey: "home-team",
      header: "Home team",
      cell: ({ row }) => {
        const { home_team } = row.original;
        if (!home_team) {
          return (
            <Badge variant="outline" className="gap-1">
              <X className="text-red-500" size={12} aria-hidden="true" />
              TBD
            </Badge>
          );
        }
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
      header: "Away team",
      cell: ({ row }) => {
        const { away_team } = row.original;
        if (!away_team) {
          return (
            <Badge variant="outline" className="gap-1">
              <X className="text-red-500" size={12} aria-hidden="true" />
              TBD
            </Badge>
          );
        }
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
      accessorKey: "display_name",
      header: "Detail",
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
        const referees = row.original.referees ?? [];
        return referees.length > 0 ? (
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
        ) : (
          <Badge variant="outline" className="cursor-help gap-1">
            <X className="text-rose-500" size={12} aria-hidden="true" />
            {referees.length} Set
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const match = row.original;
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
                <DropdownMenuItem onClick={() => handleOpenSheet(match)}>
                  Manage Schedule
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setScoreDialog({ isOpen: true, match })}
                >
                  Set Result
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
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
      <ManualScoreDialog
        open={scoreDialog.isOpen}
        match={scoreDialog.match}
        onOpenChange={(isOpen) =>
          setScoreDialog((prev) => ({ ...prev, isOpen }))
        }
        onSuccess={async () => {
          await refetchLeagueMatch();
        }}
      />

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
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <DataTablePagination showPageSize={true} table={table} />
        </div>
        <Button variant={"outline"} size={"sm"} onClick={handleRefresh}>
          Refresh
        </Button>
      </div>

      {/* Manage Sheet */}
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
          <SheetFooter className="mt-auto gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleSaveChanges}
              disabled={
                saveChangesMutation.isPending || scheduleMatchMutation.isPending
              }
            >
              {saveChangesMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              onClick={handleSaveSchedule}
              disabled={
                saveChangesMutation.isPending || scheduleMatchMutation.isPending
              }
            >
              {scheduleMatchMutation.isPending
                ? "Scheduling..."
                : "Save Schedule"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export const UnscheduleMatchTable = memo(UnscheduleTable);
