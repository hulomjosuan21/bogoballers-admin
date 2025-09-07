import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";

import ManageOfficials from "./manage-officials";
import ManangeReferees from "./manage-referees";
import ManageCourts from "./manage-courts";
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
