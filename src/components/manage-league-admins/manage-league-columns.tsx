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
import { useLeaguePDF } from "@/hooks/usePrintLeagueDocument";
import { LeagueStatus } from "@/service/leagueService";

export type LeagueColumnsProps = {
  onUpdateStatus: (leagueId: string, status: LeagueStatus) => void;
  updatingLeagueId: string | null;
};

export const getLeagueColumns = ({
  onUpdateStatus,
  updatingLeagueId,
}: LeagueColumnsProps): ColumnDef<League>[] => [
  {
    accessorKey: "league_title",
    header: "League",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.league_title}</span>
        <span className="text-xs text-muted-foreground">
          by {row.original.creator.organization_name}
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
      const [start, end] = row.original.league_schedule;
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
      <Badge variant="outline">{row.original.league_courts.length}</Badge>
    ),
  },
  {
    accessorKey: "league_officials",
    header: "Officials",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.league_officials.length}</Badge>
    ),
  },
  {
    accessorKey: "league_referees",
    header: "Referees",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.league_referees.length}</Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { preparePrint, runPrint, downloadLeague } = useLeaguePDF();
      const league = row.original;
      const isLoading = updatingLeagueId === league.league_id;

      const handlePrint = async () => {
        const result = await preparePrint(league.league_id);
        const url = await result?.unwrap();
        runPrint(url);
      };

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
                        onClick={() => onUpdateStatus(league.league_id, status)}
                      >
                        Set as{" "}
                        {status == LeagueStatus.Scheduled ? "Approved" : status}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Documents</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    key={"download"}
                    onClick={() =>
                      downloadLeague(league.league_id, league.league_title)
                    }
                  >
                    Download PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem key={"print"} onClick={handlePrint}>
                    Print
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
