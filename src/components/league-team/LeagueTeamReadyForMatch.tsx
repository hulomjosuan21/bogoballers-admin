import { useToggleOfficialLeagueTeamSection } from "@/stores/leagueTeamStores";
import type { LeagueTeamForMatch } from "@/types/team";
import { Button } from "../ui/button";
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  PersonStanding,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataGrid, DataGridContainer } from "@/components/ui/data-grid";
import { DataGridTable } from "@/components/ui/data-grid-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { LeaguePlayer } from "@/types/player";
import { useMemo } from "react";
import { Badge } from "../ui/badge";

type Props = {
  data: LeagueTeamForMatch;
};

export function LeagueTeamReadyForMatchSection({ data }: Props) {
  const { reset } = useToggleOfficialLeagueTeamSection();

  return (
    <div className="space-y-2">
      <Button size={"sm"} variant={"outline"} onClick={reset}>
        <ChevronLeft />
      </Button>
      <div className="flex items-center gap-4 p-2 border rounded-md bg-card">
        <div className="w-16 h-16 flex-shrink-0">
          <img
            src={data.team_logo_url}
            alt={data.team_name}
            className="w-full h-full object-cover rounded-md"
          />
        </div>

        <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-xs">
          <div className="flex flex-col gap-2">
            <div>
              <span className="font-semibold">Team name:</span> {data.team_name}
            </div>
            <div>
              <span className="font-semibold">Coach:</span> {data.coach_name}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div>
              <span className="font-semibold">Address:</span>{" "}
              {data.team_address}
            </div>
            <div>
              <span className="font-semibold">Assistant Coach:</span>{" "}
              {data.assistant_coach_name ?? "N/A"}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div>
              <span className="font-semibold">Players:</span>{" "}
              {data.league_players.length}
            </div>
            <div>{/* Placeholder */}</div>
          </div>
        </div>
      </div>

      <LeaguePlayerDataGrid players={data.league_players} />
    </div>
  );
}

export function LeaguePlayerDataGrid({ players }: { players: LeaguePlayer[] }) {
  const columns = useMemo<ColumnDef<LeaguePlayer>[]>(
    () => [
      {
        accessorKey: "full_name",
        header: "Player",
        cell: ({ row }) => {
          const isCaptain = row.original.is_team_captain;
          return (
            <div className="flex items-center gap-2">
              <div className="text-left">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="ml-2" align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>Ban</DropdownMenuItem>
                    <DropdownMenuItem>Remove</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Avatar className="size-8">
                <AvatarImage
                  src={row.original.profile_image_url}
                  alt={row.original.full_name}
                />
                <AvatarFallback>{row.original.full_name[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-px">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {row.original.full_name}
                  </span>
                  {isCaptain && (
                    <Badge variant="default" className="text-xs">
                      <PersonStanding className="h-4 w-4" /> Captain
                    </Badge>
                  )}
                </div>
                <div className="text-muted-foreground">
                  {row.original.user.email}
                </div>
              </div>
            </div>
          );
        },
        size: 250,
      },
      { accessorKey: "jersey_name", header: "Jersey name", size: 80 },
      {
        accessorKey: "jersey_number",
        header: "Jersey #",
        cell: (info) => <span>{info.getValue() as number}</span>,
        size: 80,
      },
      {
        accessorKey: "total_points",
        header: "Total points scored",
        size: 60,
      },
    ],
    []
  );

  const table = useReactTable({
    columns,
    data: players,
    getRowId: (row) => row.player_team_id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-2.5">
      <DataGrid
        table={table}
        recordCount={players.length}
        tableLayout={{ cellBorder: true }}
      >
        <DataGridContainer className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full min-h-0">
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </DataGridContainer>
      </DataGrid>

      <div className="flex items-center justify-start space-x-2">
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant={"outline"}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
          </Button>
          <Button
            size="sm"
            variant={"outline"}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
