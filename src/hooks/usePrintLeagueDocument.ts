import { leagueService } from "@/service/leagueService";
import { useCallback } from "react";
import { toast } from "sonner";

export function useLeaguePDF() {
  const preparePrint = useCallback(async (leagueId?: string) => {
    if (!leagueId) {
      toast.error("Unable to print");
      return;
    }

    return toast.promise(
      (async () => {
        const pdfBlob = await leagueService.getLeaguePDF(leagueId);
        const url = URL.createObjectURL(pdfBlob);
        return url;
      })(),
      {
        loading: "Preparing document...",
        success: "Document ready",
        error: "Failed to generate document",
      }
    );
  }, []);

  const runPrint = (url?: string) => {
    if (!url) {
      toast.error("Unable to print");
      return;
    }
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;

    iframe.onload = () => iframe.contentWindow?.print();
    document.body.appendChild(iframe);
  };

  const downloadLeague = useCallback(
    async (leagueId: string | undefined, leagueName: string | undefined) => {
      if (!leagueId || !leagueName) {
        toast.error("Unable to download");
        return;
      }

      toast.promise(
        (async () => {
          const pdfBlob = await leagueService.getLeaguePDF(leagueId);
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
    },
    [leagueService]
  );

  return { preparePrint, runPrint, downloadLeague };
}
