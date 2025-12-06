import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ManageAffiliates from "@/tables/ManangeAffiliateTable";
import { LeagueService } from "@/service/leagueService";
import { useQuery } from "@tanstack/react-query";
import {
  NoActiveLeagueAlert,
  PendingLeagueAlert,
} from "@/components/LeagueStatusAlert";
import useActiveLeagueMeta from "@/hooks/useActiveLeagueMeta";

export default function LeagueAffiliatePage() {
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
      <ContentHeader title="Sponsors & Partners"></ContentHeader>

      <ContentBody>
        {league && league_id && (
          <ManageAffiliates
            data={league.league_affiliates ?? []}
            activeLeagueId={league_id}
          />
        )}
      </ContentBody>
    </ContentShell>
  );
}
