import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ManageOfficials from "@/tables/ManageOfficialsTable";
import ManangeReferees from "@/tables/ManageRefereesTable";
import ManageCourts from "@/tables/ManageCourtsTable";
import { LeagueService } from "@/service/leagueService";
import { useQuery } from "@tanstack/react-query";
import {
  NoActiveLeagueAlert,
  PendingLeagueAlert,
} from "@/components/LeagueStatusAlert";
import useActiveLeagueMeta from "@/hooks/useActiveLeagueMeta";

export default function LeagueOfficialsPage() {
  const { league_status, league_id, isActive, message } = useActiveLeagueMeta();

  const { data: league } = useQuery({
    queryKey: ["active-league-data"],
    queryFn: () => LeagueService.fetchActive(),
    enabled: isActive,
    retry: 1,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  if (!isActive) {
    return (
      <NoActiveLeagueAlert message={message ?? "No active league found."} />
    );
  }

  if (isActive && league_status === "Pending") {
    return <PendingLeagueAlert />;
  }

  return (
    <ContentShell>
      <ContentHeader title="League Officials" />

      <ContentBody className="">
        {league && league_id && (
          <>
            <ManageOfficials
              data={league.league_officials ?? []}
              activeLeagueId={league_id}
            />
            <ManangeReferees
              data={league.league_referees ?? []}
              activeLeagueId={league_id}
            />
            <ManageCourts
              data={league.league_courts ?? []}
              activeLeagueId={league_id}
            />
          </>
        )}
      </ContentBody>
    </ContentShell>
  );
}
