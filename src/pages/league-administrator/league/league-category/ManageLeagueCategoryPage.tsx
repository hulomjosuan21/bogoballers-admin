import ContentHeader from "@/components/content-header";
import { Spinner } from "@/components/ui/spinner";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { LeagueCategoriesTable } from "@/tables/LeagueCategoriesTable";

export default function ManageLeagueCategoriesPage() {
  const { activeLeagueId, activeLeagueLoading, activeLeagueError } =
    useActiveLeague();

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
