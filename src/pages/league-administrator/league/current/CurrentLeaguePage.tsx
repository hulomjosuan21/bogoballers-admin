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
import { leagueService, LeagueStatus } from "@/service/leagueService";
import { toast } from "sonner";
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

  const handlePrint = async () => {
    if (!activeLeagueId) {
      toast.error("Unable to print");
      return;
    }

    toast.promise(
      (async () => {
        const pdfBlob = await leagueService.getLeaguePDF(activeLeagueId);
        const pdfUrl = URL.createObjectURL(pdfBlob);

        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = pdfUrl;
        document.body.appendChild(iframe);

        iframe.onload = () => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        };
      })(),
      {
        loading: "Preparing print...",
        success: "Document ready — printing...",
        error: "Failed to generate document",
      }
    );
  };
  const handleDownload = async () => {
    const leagueName = activeLeagueData?.league_title;
    if (!activeLeagueId || !leagueName) {
      toast.error("Unable to download");
      return;
    }

    toast.promise(
      (async () => {
        const pdfBlob = await leagueService.getLeaguePDF(activeLeagueId);
        const pdfUrl = URL.createObjectURL(pdfBlob);

        const a = document.createElement("a");
        a.href = pdfUrl;
        a.download = `${leagueName
          .replaceAll(" ", "_")
          .toLowerCase()}_document.pdf`;
        a.click();
        URL.revokeObjectURL(pdfUrl);
      })(),
      {
        loading: "Downloading...",
        success: "Download started!",
        error: "Failed to download",
      }
    );
  };

  const navigate = useNavigate();

  return (
    <ContentShell>
      <ContentHeader title="Start new League">
        <Button variant={"ghost"} size={"sm"}>
          <Info className="h-4 w-4" />
        </Button>
        <Button variant={"outline"} size={"sm"} onClick={handlePrint}>
          <Printer className="h-4 w-4" />
        </Button>
        <Button variant={"outline"} size={"sm"} onClick={handleDownload}>
          <FileDown className="h-4 w-4" />
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
