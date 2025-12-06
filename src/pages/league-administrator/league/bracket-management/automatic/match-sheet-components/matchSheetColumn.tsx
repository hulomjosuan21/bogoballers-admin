import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";

export type MatchData = {
  league_match_id: string;
  display_name: string;
  home_team_score: number | null;
  away_team_score: number | null;
  winner_team_id: string | null;
  loser_team_id: string | null;
  home_team_name: string | null;
  away_team_name: string | null;
  is_scheduled: boolean;
};

export const matchColumns: ColumnDef<MatchData>[] = [
  {
    accessorKey: "display_name",
    header: "Match",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("display_name")}</div>
    ),
  },
  {
    accessorKey: "home_team_name",
    header: () => <div className="text-right">Home</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium text-foreground">
        {row.original.home_team_name || "TBD"}
      </div>
    ),
  },
  {
    id: "score",
    header: () => <div className="text-center">Score</div>,
    cell: ({ row }) => {
      const home = row.original.home_team_score;
      const away = row.original.away_team_score;

      if (home === null || away === null)
        return <div className="text-center text-muted-foreground">- vs -</div>;

      return (
        <div className="text-center font-bold">
          {home} - {away}
        </div>
      );
    },
  },
  {
    accessorKey: "away_team_name",
    header: "Away",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">
        {row.original.away_team_name || "TBD"}
      </div>
    ),
  },
  {
    accessorKey: "is_scheduled",
    header: "Status",
    cell: ({ row }) => {
      const isScheduled = row.getValue("is_scheduled");
      const hasWinner = !!row.original.winner_team_id;

      if (hasWinner)
        return (
          <Badge variant="default" className="bg-green-600">
            Finished
          </Badge>
        );
      if (isScheduled) return <Badge variant="secondary">Scheduled</Badge>;
      return <Badge variant="outline">Unscheduled</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const match = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(match.league_match_id)
              }
            >
              Copy Match ID
            </DropdownMenuItem>
            <DropdownMenuItem>Manage Match</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
