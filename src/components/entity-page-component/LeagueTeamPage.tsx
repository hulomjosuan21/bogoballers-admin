"use client";

import { useEffect, useMemo, useState } from "react";
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
import type { LeagueTeam } from "@/types/team";
import type { LeaguePlayer } from "@/types/player";

type Props = {
  leagueTeam?: LeagueTeam;
  league_id?: string;
  league_team_id?: string;
};

export default function LeagueTeamPage({
  leagueTeam,
  league_id,
  league_team_id,
}: Props) {
  const [fetchedLeagueTeam, setFetchedLeagueTeam] = useState<LeagueTeam | null>(
    leagueTeam ?? null
  );
  const [loading, setLoading] = useState<boolean>(
    !leagueTeam && !!league_id && !!league_team_id
  );

  useEffect(() => {
    const fetchLeagueTeam = async () => {
      if (!league_id || !league_team_id || leagueTeam) return;
      try {
        setLoading(true);
        const res = await fetch(
          `/api/leagues/${league_id}/teams/${league_team_id}`
        );
        if (!res.ok) throw new Error("Failed to fetch league team");
        const data: LeagueTeam = await res.json();
        setFetchedLeagueTeam(data);
      } catch (err) {
        console.error(err);
        setFetchedLeagueTeam(null);
      } finally {
        setLoading(false);
      }
    };
    fetchLeagueTeam();
  }, [league_id, league_team_id, leagueTeam]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Loading league team...</CardTitle>
          </CardHeader>
          <CardContent>Fetching league team details...</CardContent>
        </Card>
      </div>
    );
  }

  if (!fetchedLeagueTeam) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>League Team not found</CardTitle>
          </CardHeader>
          <CardContent>No data available for this league team.</CardContent>
        </Card>
      </div>
    );
  }

  const teamData = fetchedLeagueTeam;

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

      {/* League Players Table */}
      <LeaguePlayerTable players={teamData.league_players} />
    </div>
  );
}

function LeaguePlayerTable({ players }: { players: LeaguePlayer[] }) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "full_name", desc: false },
  ]);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);

  const columns = useMemo<ColumnDef<LeaguePlayer>[]>(() => {
    return [
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
    ];
  }, []);

  const table = useReactTable({
    columns,
    data: players ?? [],
    pageCount: Math.ceil((players?.length || 0) / pagination.pageSize),
    getRowId: (row: LeaguePlayer) => row.league_player_id,
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
