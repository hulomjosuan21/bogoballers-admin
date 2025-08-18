import ContentHeader from "@/components/content-header";
import LeagueExportButton from "@/components/leagueDocxGenerator";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import {
  getActiveLeagueQueryOptions,
  getActiveLeagueResourceQueryOptions,
} from "@/queries/league";
import { authLeagueAdminQueryOptions } from "@/queries/league-admin";
import { useQueries } from "@tanstack/react-query";

export default function DashboardPage() {
  const [authLeagueAdmin, activeLeague, activeLeagueResource] = useQueries({
    queries: [
      authLeagueAdminQueryOptions,
      getActiveLeagueQueryOptions,
      getActiveLeagueResourceQueryOptions,
    ],
  });
  return (
    <ContentShell>
      <ContentHeader title="Dashboard" />
      <ContentBody></ContentBody>
    </ContentShell>
  );
}
