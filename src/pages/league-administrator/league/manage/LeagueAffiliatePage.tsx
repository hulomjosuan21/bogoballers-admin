import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ManageAffiliates from "@/tables/ManangeAffiliateTable";
import SelectedLeagueStateScreen from "@/components/selectedLeagueStateScreen";
import { LeagueService, type LeagueStatus } from "@/service/leagueService";
import { useQuery } from "@tanstack/react-query";

export default function LeagueAffiliatePage() {
  const { data: league, isLoading } = useQuery({
    queryKey: ["active-league-data"],
    queryFn: () => LeagueService.fetchActive(),
    enabled: true,
    retry: 1,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const leagueId = league?.league_id;

  if (isLoading) {
    return <SelectedLeagueStateScreen loading />;
  }

  if (!league || !leagueId) {
    return <SelectedLeagueStateScreen />;
  }

  const leagueStatus = league.status as LeagueStatus;

  const handledStates: Record<LeagueStatus, boolean> = {
    Pending: false,
    Completed: true,
    Postponed: true,
    Cancelled: true,
    Scheduled: false,
    Rejected: true,
    Ongoing: false,
  };

  if (handledStates[leagueStatus]) {
    return <SelectedLeagueStateScreen state={leagueStatus} league={league} />;
  }

  return (
    <ContentShell>
      <ContentHeader title="Sponsors & Partners"></ContentHeader>

      <ContentBody>
        <ManageAffiliates
          data={league.league_affiliates ?? []}
          hasActiveLeague={!league}
          activeLeagueId={leagueId}
        />
      </ContentBody>
    </ContentShell>
  );
}
