import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ManageAffiliates from "@/tables/ManangeAffiliateTable";
import { useMemo } from "react";
import ErrorLoading from "@/components/error-loading";
import { useActiveLeagueResource } from "@/hooks/useActiveLeague";
import { NoActiveLeagueAlert } from "@/components/noActiveLeagueAlert";

export default function LeagueAffiliatePage() {
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
      <ContentHeader title="Sponsors & Partners"></ContentHeader>

      <ContentBody>
        {activeLeagueResourceLoading || activeLeagueResourceError ? (
          <ErrorLoading
            isLoading={activeLeagueResourceLoading}
            error={activeLeagueResourceError}
          />
        ) : (
          <>
            {!hasActiveLeague && <NoActiveLeagueAlert />}
            <ManageAffiliates
              data={activeLeagueResourceData?.league_affiliates ?? []}
              hasActiveLeague={!hasActiveLeague}
            />
          </>
        )}
      </ContentBody>
    </ContentShell>
  );
}
