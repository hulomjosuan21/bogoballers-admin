import ContentHeader from "@/components/content-header";
import {
  NoActiveLeagueAlert,
  PendingLeagueAlert,
} from "@/components/LeagueStatusAlert";
import useActiveLeagueMeta from "@/hooks/useActiveLeagueMeta";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { LeagueCategoriesTable } from "@/tables/LeagueCategoriesTable";

export default function ManageLeagueCategoriesPage() {
  const { league_id, isActive, league_status, message } = useActiveLeagueMeta();

  if (!isActive) {
    return (
      <NoActiveLeagueAlert message={message ?? "No active league found."} />
    );
  }

  if (isActive && league_status === "Pending") {
    return <PendingLeagueAlert />;
  }

  return (
    <ContentShell>
      <ContentHeader title="Manage League Categories" />
      <ContentBody>
        <LeagueCategoriesTable activeLeagueId={league_id} />
      </ContentBody>
    </ContentShell>
  );
}
