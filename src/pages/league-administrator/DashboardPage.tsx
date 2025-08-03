import ContentHeader from "@/components/content-header";
import { useAuthLeagueAdmin } from "@/hooks/useAuth";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
export default function DashboardPage() {
  const { leagueAdmin } = useAuthLeagueAdmin();
  return (
    <ContentShell>
      <ContentHeader title="Dashboard" />
      <ContentBody>
        <pre>
          {leagueAdmin ? JSON.stringify(leagueAdmin, null, 2) : "No Admin"}
        </pre>
      </ContentBody>
    </ContentShell>
  );
}
