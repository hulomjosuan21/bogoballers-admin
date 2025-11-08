import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ManageAffiliates from "@/tables/ManangeAffiliateTable";
import { NoActiveLeagueAlert } from "@/components/noActiveLeagueAlert";
import LeagueNotApproveYet from "@/components/LeagueNotApproveYet";
import { Spinner } from "@/components/ui/spinner";
import { useFetchLeagueGenericData } from "@/hooks/useFetchLeagueGenericData";
import type { League } from "@/types/league";

export default function LeagueAffiliatePage() {
  const {
    isLoading: activeLeagueLoading,
    data: activeLeagueData,
    hasData,
  } = useFetchLeagueGenericData<League>({
    params: { active: true, status: ["Pending", "Scheduled", "Ongoing"] },
  });

  if (hasData && activeLeagueData?.status == "Pending") {
    return <LeagueNotApproveYet />;
  }

  if (activeLeagueLoading) {
    return (
      <div className="h-screen grid place-content-center">
        <Spinner />
      </div>
    );
  }

  return (
    <ContentShell>
      <ContentHeader title="Sponsors & Partners"></ContentHeader>

      <ContentBody>
        {!activeLeagueData && <NoActiveLeagueAlert />}
        <ManageAffiliates
          data={activeLeagueData?.league_affiliates ?? []}
          hasActiveLeague={!activeLeagueData}
        />
      </ContentBody>
    </ContentShell>
  );
}
