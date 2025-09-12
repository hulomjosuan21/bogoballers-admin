import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ManageAffiliates from "@/tables/ManangeAffiliateTable";
import { useMemo } from "react";
import ErrorLoading from "@/components/error-loading";
import { NoActiveLeagueAlert } from "@/components/noActiveLeagueAlert";
import { useActiveLeague } from "@/hooks/useActiveLeague";

export default function LeagueAffiliatePage() {
  const { activeLeagueData, activeLeagueLoading, activeLeagueError } =
    useActiveLeague();

  const hasActiveLeague = useMemo(() => {
    return activeLeagueData != null && Object.keys(activeLeagueData).length > 0;
  }, [activeLeagueData]);

  return (
    <ContentShell>
      <ContentHeader title="Sponsors & Partners"></ContentHeader>

      <ContentBody>
        {activeLeagueLoading || activeLeagueError ? (
          <ErrorLoading
            isLoading={activeLeagueLoading}
            error={activeLeagueError}
          />
        ) : (
          <>
            {!hasActiveLeague && <NoActiveLeagueAlert />}
            <ManageAffiliates
              data={activeLeagueData?.league_affiliates ?? []}
              hasActiveLeague={!hasActiveLeague}
            />
          </>
        )}
      </ContentBody>
    </ContentShell>
  );
}
