import ContentHeader from "@/components/content-header";
import SelectedLeagueStateScreen from "@/components/selectedLeagueStateScreen";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import type { LeagueStatus } from "@/service/leagueService";
import { useLeagueStore } from "@/stores/leagueStore";
import { LeagueCategoriesTable } from "@/tables/LeagueCategoriesTable";

export default function ManageLeagueCategoriesPage() {
  const { league, isLoading, leagueId } = useLeagueStore();

  if (isLoading) {
    return <SelectedLeagueStateScreen loading />;
  }

  if (!league || !leagueId) {
    return <SelectedLeagueStateScreen />;
  }

  const leagueStatus = league.status as LeagueStatus;

  const handledStates: Record<LeagueStatus, boolean> = {
    Pending: true,
    Completed: true,
    Postponed: true,
    Cancelled: true,
    Scheduled: false,
    Ongoing: false,
    Rejected: true,
  };

  if (handledStates[leagueStatus]) {
    return <SelectedLeagueStateScreen state={leagueStatus} league={league} />;
  }

  return (
    <ContentShell>
      <ContentHeader title="Manage League Categories" />
      <ContentBody>
        <LeagueCategoriesTable activeLeagueId={leagueId} />
      </ContentBody>
    </ContentShell>
  );
}
