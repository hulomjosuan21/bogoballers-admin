import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ManageAffiliates from "@/tables/ManangeAffiliateTable";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
} from "@/components/ui/alert";
import { RiSpamFill } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import ErrorLoading from "@/components/error-loading";
import { useActiveLeagueResource } from "@/hooks/useActiveLeague";

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
            {!hasActiveLeague && (
              <Alert variant="secondary">
                <AlertIcon>
                  <RiSpamFill />
                </AlertIcon>
                <AlertTitle>No active league.</AlertTitle>
                <AlertToolbar>
                  <Button
                    variant="inverse"
                    mode="link"
                    underlined="solid"
                    size="sm"
                    className="flex mt-0.5"
                    onClick={() =>
                      window.open(
                        "/about/league",
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    Learn more
                  </Button>
                </AlertToolbar>
              </Alert>
            )}
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
