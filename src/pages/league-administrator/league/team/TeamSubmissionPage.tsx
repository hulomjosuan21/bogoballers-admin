import { Suspense } from "react";
import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamSubmissionTable } from "@/tables/LeagueTeamSubmissionTable";
import { LeagueTeamSheetSheetSubmissionSheet } from "@/components/league-team/LeagueTeamManagementComponents";
import { useLeagueCategoriesRoundsGroups } from "@/hooks/useLeagueCategoriesRoundsGroups";
import { Spinner } from "@/components/ui/spinner";
import useActiveLeagueMeta from "@/hooks/useActiveLeagueMeta";
import {
  NoActiveLeagueAlert,
  PendingLeagueAlert,
} from "@/components/LeagueStatusAlert";

export default function TeamSubmissionPage() {
  const { isActive, league_status, message } = useActiveLeagueMeta();

  const {
    activeLeagueId,
    categories,
    error,
    selectedCategory,
    setSelectedCategory,
  } = useLeagueCategoriesRoundsGroups();

  if (!isActive) {
    return (
      <NoActiveLeagueAlert message={message ?? "No active league found."} />
    );
  }

  if (isActive && league_status === "Pending") {
    return <PendingLeagueAlert />;
  }

  if (error) {
    return (
      <div className="h-screen grid place-content-center">
        <p className="text-sm text-red-500">
          {error.message || "Error loading league category"}
        </p>
      </div>
    );
  }

  return (
    <ContentShell>
      <ContentHeader title="Team Submission" />
      <ContentBody>
        <div className="flex items-center">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-6 px-2 py-1 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              {categories.map((c) => (
                <SelectItem
                  key={c.league_category_id}
                  value={c.league_category_id}
                >
                  {c.category_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {categories.length > 0 && (
          <>
            <LeagueTeamSheetSheetSubmissionSheet />
            <Suspense
              key={`${selectedCategory}-${activeLeagueId}`}
              fallback={
                <div className="h-40 grid place-content-center">
                  <Spinner />
                </div>
              }
            >
              <TeamSubmissionTable
                leagueCategoryId={selectedCategory}
                leagueId={activeLeagueId}
              />
            </Suspense>
          </>
        )}
      </ContentBody>
    </ContentShell>
  );
}
