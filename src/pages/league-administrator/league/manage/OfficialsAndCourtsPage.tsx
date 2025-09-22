import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ManageOfficials from "@/tables/ManageOfficialsTable";
import ManangeReferees from "@/tables/ManageRefereesTable";
import ManageCourts from "@/tables/ManageCourtsTable";
import { useMemo } from "react";
import ErrorLoading from "@/components/error-loading";
import { NoActiveLeagueAlert } from "@/components/noActiveLeagueAlert";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import LeagueNotApproveYet from "@/components/LeagueNotApproveYet";

export default function LeagueOfficialsPage() {
  const { activeLeagueData, activeLeagueLoading, activeLeagueError } =
    useActiveLeague();

  const hasActiveLeague = useMemo(() => {
    return activeLeagueData != null && Object.keys(activeLeagueData).length > 0;
  }, [activeLeagueData]);

  if (activeLeagueData?.status == "Pending") {
    return <LeagueNotApproveYet />;
  }

  return (
    <ContentShell>
      <ContentHeader title="League Officials" />

      <ContentBody className="">
        {activeLeagueLoading || activeLeagueError ? (
          <ErrorLoading
            isLoading={activeLeagueLoading}
            error={activeLeagueError}
          />
        ) : (
          <>
            {!hasActiveLeague && <NoActiveLeagueAlert />}
            <ManageOfficials
              data={activeLeagueData?.league_officials ?? []}
              hasActiveLeague={!hasActiveLeague}
            />
            <ManangeReferees
              data={activeLeagueData?.league_referees ?? []}
              hasActiveLeague={!hasActiveLeague}
            />
            <ManageCourts
              data={activeLeagueData?.league_courts ?? []}
              hasActiveLeague={!hasActiveLeague}
            />
          </>
        )}
      </ContentBody>
    </ContentShell>
  );
}
