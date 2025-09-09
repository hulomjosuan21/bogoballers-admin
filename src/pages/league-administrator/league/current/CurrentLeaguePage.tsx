import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Info } from "lucide-react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
} from "@/components/ui/alert";
import { RiSpamFill } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import UpdateLeagueForm from "@/forms/UpdateLeagueForm";
import { useNavigate } from "react-router-dom";
export default function LeagueUpdatePage() {
  const { activeLeagueData, activeLeagueLoading } = useActiveLeague();
  const navigate = useNavigate();

  const hasActiveLeague = useMemo(() => {
    return activeLeagueData != null && Object.keys(activeLeagueData).length > 0;
  }, [activeLeagueData]);

  return (
    <ContentShell>
      <ContentHeader title="Start new League">
        <Button variant={"ghost"} size={"sm"}>
          <Info />
        </Button>
      </ContentHeader>

      <ContentBody>
        {!hasActiveLeague && (
          <Alert variant="info">
            <AlertIcon>
              <RiSpamFill />
            </AlertIcon>
            <AlertTitle>Start new league.</AlertTitle>
            <AlertToolbar>
              <Button
                variant="inverse"
                mode="link"
                underlined="solid"
                size="sm"
                className="flex mt-0.5"
                onClick={() =>
                  navigate("/league-administrator/pages/league/new")
                }
              >
                Go to creation page
              </Button>
            </AlertToolbar>
          </Alert>
        )}
        {!activeLeagueLoading && activeLeagueData && (
          <UpdateLeagueForm
            hasActive={!hasActiveLeague}
            activeLeague={activeLeagueData}
            activeLeagueLoading={activeLeagueLoading}
          />
        )}
      </ContentBody>
    </ContentShell>
  );
}
