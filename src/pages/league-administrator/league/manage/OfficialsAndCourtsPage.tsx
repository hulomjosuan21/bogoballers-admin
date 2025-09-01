import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";

import ManageOfficials from "./manage-officials";
import ManangeReferees from "./manage-referees";
import ManageCourts from "./manage-courts";
import { useQueries } from "@tanstack/react-query";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
} from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { RiSpamFill } from "@remixicon/react";

import { Button } from "@/components/ui/button";
import {
  getActiveLeagueQueryOption,
  getActiveLeagueResourceQueryOption,
} from "@/queries/league";
import { useMemo } from "react";

export default function LeagueOfficialsPage() {
  const [{ data: activeLeague }, { data, isLoading, error }] = useQueries({
    queries: [getActiveLeagueQueryOption, getActiveLeagueResourceQueryOption],
  });
  const hasActiveLeague = useMemo(() => {
    return activeLeague != null && Object.keys(activeLeague).length > 0;
  }, [activeLeague]);
  return (
    <ContentShell>
      <ContentHeader title="League Officials" />

      <ContentBody className="">
        {isLoading ? (
          <div className="centered-container">
            <Loader2 className="spinner-primary" />
          </div>
        ) : error ? (
          <div className="centered-container">
            <p className="text-primary">{error.message}</p>
          </div>
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
              data={data?.league_officials ?? []}
              hasActiveLeague={!hasActiveLeague}
            />
            <ManangeReferees
              data={data?.league_referees ?? []}
              hasActiveLeague={!hasActiveLeague}
            />
            <ManageCourts
              data={data?.league_courts ?? []}
              hasActiveLeague={!hasActiveLeague}
            />
          </>
        )}
      </ContentBody>
    </ContentShell>
  );
}
