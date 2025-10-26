import { Button } from "@/components/ui/button";
import { useToggleUpcomingMatchSection } from "@/stores/matchStore";
import type { LeagueMatch } from "@/types/leagueMatch";
import { ChevronLeft, MoreVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { LeaguePlayer } from "@/types/player";
import { memo, useEffect, useState, useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import MultipleSelector from "@/components/ui/multiselect";
import { DateTimePicker } from "@/components/datetime-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LeagueCourt, LeagueReferee } from "@/types/league";
import { LeagueMatchService } from "@/service/leagueMatchService";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  upcomingMatch: LeagueMatch;
  refereesOption: LeagueReferee[];
  courtOption: LeagueCourt[];
};

type UpdatetableFields = {
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

export const ConfigUpcomingMatch = memo(
  ({ upcomingMatch, refereesOption, courtOption }: Props) => {
    const { reset } = useToggleUpcomingMatchSection();

    const homeTeamPlayers = upcomingMatch.home_team?.league_players ?? [];
    const awayTeamPlayers = upcomingMatch.away_team?.league_players ?? [];

    const initForm = (match: LeagueMatch): UpdatetableFields => ({
      scheduled_date: match.scheduled_date
        ? new Date(match.scheduled_date)
        : undefined,
      court: match.court || "",
      quarters: match.quarters,
      minutes_per_quarter: match.minutes_per_quarter,
      minutes_per_overtime: match.minutes_per_overtime,
      referees: match.referees?.map((r) => ({ label: r, value: r })) ?? [],
    });

    const [sheetFormData, setSheetFormData] = useState<UpdatetableFields>({});

    const handleFormChange = (field: keyof UpdatetableFields, value: any) => {
      setSheetFormData((prev) => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
      setSheetFormData(initForm(upcomingMatch));
    }, []);

    const [isPending, startTransition] = useTransition();

    const handleSaveChanges = () => {
      startTransition(async () => {
        try {
          await LeagueMatchService.updateOne(upcomingMatch.league_match_id, {
            ...sheetFormData,
            referees: sheetFormData.referees?.map((r) => r.value),
            scheduled_date: sheetFormData.scheduled_date?.toISOString(),
          });
          toast.success("Update successful");
        } catch (err) {
          toast.error(getErrorMessage(err) || "An error occurred");
        }
      });
    };

    const extraSmallCell = (
      accessorKey: keyof LeaguePlayer,
      header: string,
      withIndex: boolean = false
    ): ColumnDef<LeaguePlayer> => {
      return {
        accessorKey,
        header,
        cell: ({ row }) => {
          const value = row.original[accessorKey];

          const index = row.index + 1;

          return (
            <span className="text-xs">
              {withIndex ? `${index}. ` : ""}
              {typeof value === "string" || typeof value === "number"
                ? value
                : value === null || value === undefined
                ? null
                : JSON.stringify(value)}
            </span>
          );
        },
      };
    };

    const homeTeamPlayerColumns: ColumnDef<LeaguePlayer>[] = [
      {
        accessorKey: "full_name",
        header: "Full name",
        cell: ({ row }) => {
          const p = row.original;
          const index = row.index + 1;
          return (
            <span className="text-xs">
              {index}. {p.full_name}
            </span>
          );
        },
      },
      extraSmallCell("jersey_name", "Jersey Name"),
      extraSmallCell("jersey_number", "jersey #"),
      {
        accessorKey: "action",
        header: "",
        cell: () => {
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>Include first 5</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ];
    const awayTeamPlayerColumns: ColumnDef<LeaguePlayer>[] = [
      {
        accessorKey: "full_name",
        header: "Full name",
        cell: ({ row }) => {
          const p = row.original;
          const index = row.index + 1;
          return (
            <div className="flex items-center gap-1">
              <span className="text-xs">
                {index}. {p.full_name}
              </span>
              {p.include_first5 && (
                <Badge className="text-[10px]">First 5</Badge>
              )}
            </div>
          );
        },
      },
      extraSmallCell("jersey_name", "Jersey Name"),
      extraSmallCell("jersey_number", "jersey #"),
      {
        accessorKey: "action",
        header: "",
        cell: () => {
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>Include first 5</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ];

    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={reset}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div>
          <div className="bg-card rounded-md p-2 border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label>Schedule Date & Time</Label>
              <DateTimePicker
                dateTime={sheetFormData.scheduled_date}
                setDateTime={(date) => handleFormChange("scheduled_date", date)}
              />
            </div>

            <div className="space-y-2">
              <Label>Quarters</Label>
              <Input
                type="number"
                value={sheetFormData.quarters ?? ""}
                onChange={(e) =>
                  handleFormChange("quarters", e.target.valueAsNumber)
                }
              />
            </div>

            <div className="space-y-2">
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

            <div className="space-y-2">
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

            <div className="space-y-2">
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

            <div className="flex flex-col gap-3">
              <div className="space-y-2">
                <Label>Court</Label>
                <Select
                  value={sheetFormData.court}
                  onValueChange={(value) => handleFormChange("court", value)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select Court" />
                  </SelectTrigger>
                  <SelectContent>
                    {courtOption.map((court) => (
                      <SelectItem
                        key={court.name}
                        value={court.name}
                        className="text-xs"
                      >
                        {court.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full sm:w-auto self-end"
                onClick={handleSaveChanges}
                disabled={isPending}
              >
                {isPending && <Spinner />}Save Changes
              </Button>
            </div>
          </div>
        </div>

        <div className="">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <DataTable data={homeTeamPlayers} columns={homeTeamPlayerColumns} />
            <DataTable data={awayTeamPlayers} columns={awayTeamPlayerColumns} />
          </div>
        </div>
      </div>
    );
  }
);

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
                <TableHead key={header.id} className="text-xs">
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
