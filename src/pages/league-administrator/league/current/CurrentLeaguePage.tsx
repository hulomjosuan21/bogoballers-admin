import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { FileDown, Info, Printer } from "lucide-react";
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
import { LeagueStatus } from "@/service/leagueService";
import { useLeaguePDF } from "@/hooks/usePrintLeagueDocument";
export default function LeagueUpdatePage() {
  const {
    leagueId: activeLeagueId,
    data: activeLeagueData,
    isLoading: activeLeagueLoading,
    hasData,
  } = useFetchLeagueGenericData<League>({
    key: ["is-active"],
    params: {
      active: true,
      status: [
        LeagueStatus.Pending,
        LeagueStatus.Scheduled,
        LeagueStatus.Ongoing,
      ],
    },
  });

  const { runPrint, preparePrint, downloadLeague } = useLeaguePDF();

  const handlePrint = async () => {
    const result = await preparePrint(activeLeagueId);
    const url = await result?.unwrap();
    runPrint(url);
  };

  const navigate = useNavigate();

  return (
    <ContentShell>
      <ContentHeader title="Start new League">
        <Button variant={"ghost"} size={"sm"}>
          <Info className="h-4 w-4" />
        </Button>

        {activeLeagueId && (
          <>
            <Button variant={"outline"} size={"sm"} onClick={handlePrint}>
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              variant={"outline"}
              size={"sm"}
              onClick={() =>
                downloadLeague(activeLeagueId, activeLeagueData?.league_title)
              }
            >
              <FileDown className="h-4 w-4" />
            </Button>
          </>
        )}
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
