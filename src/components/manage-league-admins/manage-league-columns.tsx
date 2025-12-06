import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { League } from "@/types/league";
import { LeagueStatus } from "@/service/leagueService";
import { openActivityDesignPDF } from "../pdf/LeaguePdf";
import type { LeagueAdministator } from "@/types/leagueAdmin";

export type LeagueColumnsProps = {
  onUpdateStatus: (leagueId: string, status: LeagueStatus) => void;
  updatingLeagueId: string | null;
};

export const getLeagueColumns = ({
  onUpdateStatus,
  updatingLeagueId,
}: LeagueColumnsProps): ColumnDef<Partial<League>>[] => [
  {
    accessorKey: "league_title",
    header: "League",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.league_title}</span>
        <span className="text-xs text-muted-foreground">
          by {row.original.creator?.organization_name ?? "N/A"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      let variant: "default" | "secondary" | "destructive" | "outline" =
        "outline";
      if (status === LeagueStatus.Scheduled || status === LeagueStatus.Ongoing)
        variant = "default";
      if (status === LeagueStatus.Pending) variant = "secondary";
      if (status === LeagueStatus.Rejected) variant = "destructive";

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "league_schedule",
    header: "Schedule",
    cell: ({ row }) => {
      const [start, end] = row.original.league_schedule ?? ["", ""];
      return (
        <div className="text-sm">
          {format(new Date(start), "MMM d, yyyy")} -{" "}
          {format(new Date(end), "MMM d, yyyy")}
        </div>
      );
    },
  },
  {
    accessorKey: "league_courts",
    header: "Courts",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.league_courts?.length ?? 0}</Badge>
    ),
  },
  {
    accessorKey: "league_officials",
    header: "Officials",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.league_officials?.length ?? 0}
      </Badge>
    ),
  },
  {
    accessorKey: "league_referees",
    header: "Referees",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.league_referees?.length ?? 0}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const league = row.original;
      const isLoading = updatingLeagueId === league.league_id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreHorizontal className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>League Actions</DropdownMenuLabel>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {Object.values(LeagueStatus)
                    .filter((status) =>
                      [LeagueStatus.Scheduled, LeagueStatus.Rejected].includes(
                        status
                      )
                    )
                    .map((status) => (
                      <DropdownMenuItem
                        key={status}
                        disabled={league.status === status}
                        onClick={() =>
                          onUpdateStatus(league.league_id!, status)
                        }
                      >
                        Set as{" "}
                        {status == LeagueStatus.Scheduled ? "Approved" : status}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Documents</DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={() => {
                openActivityDesignPDF(
                  league as League,
                  league.creator as LeagueAdministator
                );
              }}
            >
              Print
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
