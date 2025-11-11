import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ManageAffiliates from "@/tables/ManangeAffiliateTable";
import { useLeagueStore } from "@/stores/leagueStore";
import SelectedLeagueStateScreen from "@/components/selectedLeagueStateScreen";
import { LeagueStatus } from "@/service/leagueService";

export default function LeagueAffiliatePage() {
  const { league, isLoading, leagueId } = useLeagueStore();

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
