import { formatDate12h } from "@/lib/app_utils";
import { type ColumnDef } from "@tanstack/react-table";
import type { CompletedMatch, UpcomingMatch } from "./matchTypes";

export const upcomingColumns: ColumnDef<UpcomingMatch>[] = [
  {
    accessorKey: "schedule_date",
    header: "Schedule Date",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col max-w-[200px]">
          <span className="font-medium">
            {formatDate12h(row.original.schedule_date)}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {row.original.detail}
          </span>
        </div>
      );
    },
  },
  {
    header: () => <div className="text-right">Home Team</div>,
    accessorKey: "home_team",
    cell: ({ row }) => {
      const team = row.original.home_team;
      return (
        <div className="flex w-full items-center justify-end gap-3 text-right">
          <div className="flex flex-col">
            <span className="font-bold">{team.team_name}</span>
            <span className="text-xs text-muted-foreground">
              ({team.wins} - {team.losses})
            </span>
          </div>
          <img
            src={team.team_logo_url || "/placeholder-logo.png"}
            alt={team.team_name}
            className="h-10 w-10 rounded-full bg-muted object-contain"
          />
        </div>
      );
    },
  },
  {
    id: "versus",
    header: () => <div className="text-center"></div>,
    cell: () => (
      <div className="flex w-full justify-center">
        <span className="px-2 font-bold text-muted-foreground/50">VS</span>
      </div>
    ),
  },
  {
    header: () => <div className="text-left">Away Team</div>,
    accessorKey: "away_team",
    cell: ({ row }) => {
      const team = row.original.away_team;
      return (
        <div className="flex w-full items-center justify-start gap-3 text-left">
          <img
            src={team.team_logo_url || "/placeholder-logo.png"}
            alt={team.team_name}
            className="h-10 w-10 rounded-full bg-muted object-contain"
          />
          <div className="flex flex-col">
            <span className="font-bold">{team.team_name}</span>
            <span className="text-xs text-muted-foreground">
              ({team.wins} - {team.losses})
            </span>
          </div>
        </div>
      );
    },
  },
];

export const completedColumns: ColumnDef<CompletedMatch>[] = [
  {
    accessorKey: "detail",
    header: "Detail",
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        <span
          className="text-muted-foreground block text-xs font-xs truncate"
          title={row.original.detail}
        >
          {row.original.detail}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "home_team",
    header: () => <div className="text-right">Home Team</div>,
    cell: ({ row }) => {
      const team = row.original.home_team;
      const isWinner =
        parseInt(row.original.home_team_score) >
        parseInt(row.original.away_team_score);

      return (
        <div className="flex w-full items-center justify-end gap-3 text-right">
          <div className="flex flex-col">
            <span
              className={`text-xs font-bold ${
                isWinner ? "text-green-600" : ""
              }`}
            >
              {team.team_name}
            </span>
            <span className="text-xs text-muted-foreground">
              ({team.wins} - {team.losses})
            </span>
          </div>
          <img
            src={team.team_logo_url || "/placeholder-logo.png"}
            alt={team.team_name}
            className="h-10 w-10 rounded-full object-contain"
          />
        </div>
      );
    },
  },
  {
    id: "score",
    header: () => <div className="text-center">Score</div>,
    cell: ({ row }) => {
      return (
        <div className="flex w-full justify-center">
          <div className="rounded-md bg-slate-100 px-3 py-1 font-mono text-lg font-bold dark:bg-slate-800">
            {row.original.home_team_score} - {row.original.away_team_score}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "away_team",
    header: () => <div className="text-left">Away Team</div>,
    cell: ({ row }) => {
      const team = row.original.away_team;
      const isWinner =
        parseInt(row.original.away_team_score) >
        parseInt(row.original.home_team_score);

      return (
        <div className="flex w-full items-center justify-start gap-3 text-left">
          <img
            src={team.team_logo_url || "/placeholder-logo.png"}
            alt={team.team_name}
            className="h-10 w-10 rounded-full object-contain"
          />
          <div className="flex flex-col">
            <span
              className={`text-xs font-bold ${
                isWinner ? "text-green-600" : ""
              }`}
            >
              {team.team_name}
            </span>
            <span className="text-xs text-muted-foreground">
              ({team.wins} - {team.losses})
            </span>
          </div>
        </div>
      );
    },
  },
];
