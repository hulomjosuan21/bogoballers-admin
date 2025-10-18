import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ManageAffiliates from "@/tables/ManangeAffiliateTable";
import { NoActiveLeagueAlert } from "@/components/noActiveLeagueAlert";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import LeagueNotApproveYet from "@/components/LeagueNotApproveYet";
import { Spinner } from "@/components/ui/spinner";

export default function LeagueAffiliatePage() {
  const { activeLeagueData, activeLeagueLoading } = useActiveLeague();

  if (activeLeagueData?.status == "Pending") {
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
