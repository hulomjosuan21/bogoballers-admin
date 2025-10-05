import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";

import { useActiveLeague } from "@/hooks/useActiveLeague";
import { NoActiveLeagueAlert } from "@/components/noActiveLeagueAlert";
import LeagueNotApproveYet from "@/components/LeagueNotApproveYet";
import { LeagueGuestTable } from "@/tables/LeagueGuestTable";

import { Loader2 } from "lucide-react";

export default function LeagueGuestPage() {
  const { activeLeagueId, activeLeagueData, activeLeagueLoading } =
    useActiveLeague();

  const hasActiveLeague =
    activeLeagueData != null && Object.keys(activeLeagueData).length > 0;

  if (activeLeagueLoading) {
    return (
      <ContentShell>
        <ContentHeader title="Manage League Guest" />
        <ContentBody className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </ContentBody>
      </ContentShell>
    );
  }

  if (activeLeagueData?.status === "Pending") {
    return <LeagueNotApproveYet />;
  }

  return (
    <ContentShell>
      <ContentHeader title="Manage League Guest" />
      <ContentBody>
        {!hasActiveLeague || !activeLeagueId ? (
          <NoActiveLeagueAlert />
        ) : (
          <LeagueGuestTable leagueId={activeLeagueId} />
        )}
      </ContentBody>
    </ContentShell>
  );
}
