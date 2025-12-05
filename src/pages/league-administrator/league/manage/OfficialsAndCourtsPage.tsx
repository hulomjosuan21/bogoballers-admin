import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ManageOfficials from "@/tables/ManageOfficialsTable";
import ManangeReferees from "@/tables/ManageRefereesTable";
import ManageCourts from "@/tables/ManageCourtsTable";
import { NoActiveLeagueAlert } from "@/components/noActiveLeagueAlert";
import SelectedLeagueStateScreen from "@/components/selectedLeagueStateScreen";
import { LeagueService, type LeagueStatus } from "@/service/leagueService";
import { useQuery } from "@tanstack/react-query";

export default function LeagueOfficialsPage() {
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
    Rejected: true,
    Cancelled: true,
    Scheduled: false,
    Ongoing: false,
  };

  if (handledStates[leagueStatus]) {
    return <SelectedLeagueStateScreen state={leagueStatus} league={league} />;
  }

  return (
    <ContentShell>
      <ContentHeader title="League Officials" />

      <ContentBody className="">
        <>
          {!league && <NoActiveLeagueAlert />}
          <ManageOfficials
            data={league.league_officials ?? []}
            hasActiveLeague={!league}
            activeLeagueId={leagueId}
          />
          <ManangeReferees
            data={league?.league_referees ?? []}
            hasActiveLeague={!league}
            activeLeagueId={leagueId}
          />
          <ManageCourts
            data={league?.league_courts ?? []}
            hasActiveLeague={!league}
            activeLeagueId={leagueId}
          />
        </>
      </ContentBody>
    </ContentShell>
  );
}
