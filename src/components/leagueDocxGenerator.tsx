import { useState } from "react";
import { ButtonLoading } from "./custom-buttons";
import { LeagueService } from "@/service/leagueService";

export default function LeagueExportButton({ leagueId }: { leagueId: string }) {
  const [isProcessing, setProcess] = useState(false);
  const handleExport = async () => {
    setProcess(true);
    try {
      await LeagueService.exportLeaguePDF(leagueId);
    } catch (error) {
      console.error("Error exporting league DOCX:", error);
      alert("Failed to export DOCX.");
    } finally {
      setProcess(false);
    }
  };

  return (
    <ButtonLoading loading={isProcessing} onClick={handleExport}>
      Export League DOCX
    </ButtonLoading>
  );
}
