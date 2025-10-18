import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ManageOfficials from "@/tables/ManageOfficialsTable";
import ManangeReferees from "@/tables/ManageRefereesTable";
import ManageCourts from "@/tables/ManageCourtsTable";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import LeagueNotApproveYet from "@/components/LeagueNotApproveYet";
import { Spinner } from "@/components/ui/spinner";
import { NoActiveLeagueAlert } from "@/components/noActiveLeagueAlert";

export default function LeagueOfficialsPage() {
  const { activeLeagueData, activeLeagueLoading } = useActiveLeague();

  if (activeLeagueData?.status == "Pending") {
    return <LeagueNotApproveYet />;
  }

  if (activeLeagueLoading) {
    return (
      <div className="h-screen grid place-content-center">
        <Spinner />
      </div>
    );
  }

  return (
    <ContentShell>
      <ContentHeader title="League Officials" />

      <ContentBody className="">
        <>
          {!activeLeagueData && <NoActiveLeagueAlert />}
          <ManageOfficials
            data={activeLeagueData?.league_officials ?? []}
            hasActiveLeague={!activeLeagueData}
          />
          <ManangeReferees
            data={activeLeagueData?.league_referees ?? []}
            hasActiveLeague={!activeLeagueData}
          />
          <ManageCourts
            data={activeLeagueData?.league_courts ?? []}
            hasActiveLeague={!activeLeagueData}
          />
        </>
      </ContentBody>
    </ContentShell>
  );
}
