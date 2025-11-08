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
import UpdateLeagueForm from "@/forms/UpdateLeagueForm";
import { useNavigate } from "react-router-dom";
import { useFetchLeagueGenericData } from "@/hooks/useFetchLeagueGenericData";
import type { League } from "@/types/league";
export default function LeagueUpdatePage() {
  const {
    leagueId: activeLeagueId,
    data: activeLeagueData,
    isLoading: activeLeagueLoading,
    hasData,
  } = useFetchLeagueGenericData<League>({
    params: { active: true, status: ["Pending", "Scheduled", "Ongoing"] },
  });

  const navigate = useNavigate();

  return (
    <ContentShell>
      <ContentHeader title="Start new League">
        <Button variant={"ghost"} size={"sm"}>
          <Info />
        </Button>
      </ContentHeader>

      <ContentBody>
        {!hasData && (
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
            leagueId={activeLeagueId!}
            hasActive={!hasData}
            activeLeague={activeLeagueData}
            activeLeagueLoading={activeLeagueLoading}
          />
        )}
      </ContentBody>
    </ContentShell>
  );
}
