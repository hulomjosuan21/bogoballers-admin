import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ManageAffiliates from "./manange-affiliate";
import { useQueries } from "@tanstack/react-query";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
} from "@/components/ui/alert";
import { RiSpamFill } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import {
  getActiveLeagueQueryOption,
  getActiveLeagueResourceQueryOption,
} from "@/queries/leagueQueryOption";
import { useMemo } from "react";
import ErrorLoading from "@/components/error-loading";

export default function LeagueAffiliatePage() {
  const [{ data: activeLeague }, { data, isLoading, error }] = useQueries({
    queries: [getActiveLeagueQueryOption, getActiveLeagueResourceQueryOption],
  });
  const hasActiveLeague = useMemo(() => {
    return activeLeague != null && Object.keys(activeLeague).length > 0;
  }, [activeLeague]);

  return (
    <ContentShell>
      <ContentHeader title="Sponsors & Partners"></ContentHeader>

      <ContentBody>
        {isLoading || error ? (
          <ErrorLoading isLoading={isLoading} error={error} />
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
              data={data?.league_affiliates ?? []}
              hasActiveLeague={!hasActiveLeague}
            />
          </>
        )}
      </ContentBody>
    </ContentShell>
  );
}
