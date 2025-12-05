import ContentHeader from "@/components/content-header";
import SelectedLeagueStateScreen from "@/components/selectedLeagueStateScreen";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { LeagueService, type LeagueStatus } from "@/service/leagueService";
import { LeagueCategoriesTable } from "@/tables/LeagueCategoriesTable";
import { useQuery } from "@tanstack/react-query";

export default function ManageLeagueCategoriesPage() {
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
