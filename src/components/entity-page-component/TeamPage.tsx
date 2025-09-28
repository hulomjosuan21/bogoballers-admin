import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataGrid, DataGridContainer } from "@/components/ui/data-grid";
import { DataGridPagination } from "@/components/ui/data-grid-pagination";
import { DataGridTable } from "@/components/ui/data-grid-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  type ColumnDef,
  type ColumnOrderState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import type { Team } from "@/types/team";
import type { PlayerTeam } from "@/types/player";

type Props = {
  team?: Team;
  team_id?: string;
};

export default function TeamPage({ team, team_id }: Props) {
  const [fetchedTeam, setFetchedTeam] = useState<Team | null>(team ?? null);
  const [loading, setLoading] = useState<boolean>(!team && !!team_id);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!team_id || team) return;
      try {
        setLoading(true);
        setFetchedTeam(null);
      } catch (err) {
        console.error(err);
        setFetchedTeam(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [team_id, team]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Loading team...</CardTitle>
          </CardHeader>
          <CardContent>Fetching team details...</CardContent>
        </Card>
      </div>
    );
  }

  if (!fetchedTeam) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Team not found</CardTitle>
          </CardHeader>
          <CardContent>No data available for this team.</CardContent>
        </Card>
      </div>
    );
  }

  const teamData = fetchedTeam;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Team Header */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={teamData.team_logo_url}
              alt={teamData.team_name}
            />
            <AvatarFallback>{teamData.team_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <CardTitle>{teamData.team_name}</CardTitle>
            <p className="text-muted-foreground">{teamData.team_address}</p>
            <p className="text-sm">
              Coach: <span className="font-medium">{teamData.coach_name}</span>
            </p>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="accepted_players" className="w-full">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="accepted_players">Accepted</TabsTrigger>
          <TabsTrigger value="pending_players">Pending</TabsTrigger>
          <TabsTrigger value="rejected_players">Rejected</TabsTrigger>
          <TabsTrigger value="invited_players">Invited</TabsTrigger>
          <TabsTrigger value="stanby_players">Standby</TabsTrigger>
          <TabsTrigger value="guest_players">Guest</TabsTrigger>
        </TabsList>

        {(
          [
            "accepted_players",
            "pending_players",
            "rejected_players",
            "invited_players",
            "stanby_players",
            "guest_players",
          ] as const
        ).map((key) => (
          <TabsContent key={key} value={key}>
            <PlayerTable players={teamData[key]} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function PlayerTable({ players }: { players: PlayerTeam[] }) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "full_name", desc: false },
  ]);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);

  const columns = useMemo<ColumnDef<PlayerTeam>[]>(
    () => [
      {
        accessorKey: "full_name",
        id: "full_name",
        header: "Player",
        cell: ({ row }) => {
          const player = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage
                  src={player.profile_image_url}
                  alt={player.full_name}
                />
                <AvatarFallback>{player.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-px">
                <div className="font-medium">{player.full_name}</div>
                <div className="text-muted-foreground text-xs">
                  #{player.jersey_number} — {player.jersey_name}
                </div>
              </div>
            </div>
          );
        },
        size: 250,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorKey: "position",
        header: "Position",
        cell: ({ row }) => <span>{row.original.position.join(", ")}</span>,
        size: 120,
      },
      {
        accessorKey: "is_team_captain",
        header: "Captain",
        cell: ({ row }) =>
          row.original.is_team_captain ? (
            <span className="font-semibold text-primary">Yes</span>
          ) : (
            "No"
          ),
        size: 80,
      },
      {
        accessorKey: "total_points_scored",
        header: "Points",
        cell: ({ row }) => <span>{row.original.total_points_scored}</span>,
        size: 100,
      },
      {
        accessorKey: "total_assists",
        header: "Assists",
        cell: ({ row }) => <span>{row.original.total_assists}</span>,
        size: 100,
      },
      {
        accessorKey: "total_rebounds",
        header: "Rebounds",
        cell: ({ row }) => <span>{row.original.total_rebounds}</span>,
        size: 100,
      },
    ],
    []
  );

  const table = useReactTable({
    columns,
    data: players ?? [],
    pageCount: Math.ceil((players?.length || 0) / pagination.pageSize),
    getRowId: (row: PlayerTeam) => row.player_team_id,
    state: { pagination, sorting, columnOrder },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <DataGrid
      table={table}
      recordCount={players?.length || 0}
      tableLayout={{ cellBorder: true }}
    >
      <div className="w-full space-y-2.5">
        <DataGridContainer>
          <ScrollArea>
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </DataGridContainer>
        <DataGridPagination />
      </div>
    </DataGrid>
  );
}
