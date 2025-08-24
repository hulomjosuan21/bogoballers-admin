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
import {
  getActiveLeagueQueryOptions,
  getActiveLeagueResourceQueryOptions,
} from "@/queries/league";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function LeagueOfficialsPage() {
  const [activeLeague, { data, isLoading, error }] = useQueries({
    queries: [getActiveLeagueQueryOptions, getActiveLeagueResourceQueryOptions],
  });
  const navigate = useNavigate();
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
            {!activeLeague.data && (
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
                    onClick={() => navigate("/public/about/league")}
                  >
                    Learn more
                  </Button>
                </AlertToolbar>
              </Alert>
            )}
            <ManageOfficials
              data={data?.league_officials ?? []}
              hasActiveLeague={!!!activeLeague.data}
            />
            <ManangeReferees
              data={data?.league_referees ?? []}
              hasActiveLeague={!!!activeLeague.data}
            />
            <ManageCourts
              data={data?.league_courts ?? []}
              hasActiveLeague={!!!activeLeague.data}
            />
          </>
        )}
      </ContentBody>
    </ContentShell>
  );
}
