import ContentHeader from "@/components/content-header";
import { Spinner } from "@/components/ui/spinner";
import { useFetchLeagueGenericData } from "@/hooks/useFetchLeagueGenericData";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { LeagueCategoriesTable } from "@/tables/LeagueCategoriesTable";
import type { League } from "@/types/league";

export default function ManageLeagueCategoriesPage() {
  const {
    leagueId: activeLeagueId,
    isLoading: activeLeagueLoading,
    error: activeLeagueError,
  } = useFetchLeagueGenericData<League>({
    params: { active: true, status: ["Pending", "Scheduled", "Ongoing"] },
  });

  if (activeLeagueLoading) {
    return (
      <div className="h-screen grid place-content-center">
        <Spinner />
      </div>
    );
  }

  if (activeLeagueError) {
    return (
      <div className="h-screen grid place-content-center">
        <p className="text-sm text-red-500">
          {activeLeagueError.message || "Error loading league categories"}
        </p>
      </div>
    );
  }

  return (
    <ContentShell>
      <ContentHeader title="Manage League Categories" />
      <ContentBody>
        <LeagueCategoriesTable activeLeagueId={activeLeagueId} />
      </ContentBody>
    </ContentShell>
  );
}
