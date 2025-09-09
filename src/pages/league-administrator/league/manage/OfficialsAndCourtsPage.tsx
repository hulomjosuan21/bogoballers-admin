import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ManageOfficials from "@/tables/ManageOfficialsTable";
import ManangeReferees from "@/tables/ManageRefereesTable";
import ManageCourts from "@/tables/ManageCourtsTable";
import { useMemo } from "react";
import ErrorLoading from "@/components/error-loading";
import { useActiveLeagueResource } from "@/hooks/useActiveLeague";
import { NoActiveLeagueAlert } from "@/components/noActiveLeagueAlert";

export default function LeagueOfficialsPage() {
  const {
    activeLeagueData,
    activeLeagueResourceData,
    activeLeagueResourceLoading,
    activeLeagueResourceError,
  } = useActiveLeagueResource();

  const hasActiveLeague = useMemo(() => {
    return activeLeagueData != null && Object.keys(activeLeagueData).length > 0;
  }, [activeLeagueData]);

  return (
    <ContentShell>
      <ContentHeader title="League Officials" />

      <ContentBody className="">
        {activeLeagueResourceLoading || activeLeagueResourceError ? (
          <ErrorLoading
            isLoading={activeLeagueResourceLoading}
            error={activeLeagueResourceError}
          />
        ) : (
          <>
            {!hasActiveLeague && <NoActiveLeagueAlert />}
            <ManageOfficials
              data={activeLeagueResourceData?.league_officials ?? []}
              hasActiveLeague={!hasActiveLeague}
            />
            <ManangeReferees
              data={activeLeagueResourceData?.league_referees ?? []}
              hasActiveLeague={!hasActiveLeague}
            />
            <ManageCourts
              data={activeLeagueResourceData?.league_courts ?? []}
              hasActiveLeague={!hasActiveLeague}
            />
          </>
        )}
      </ContentBody>
    </ContentShell>
  );
}
