import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import LeagueTeamsTable from "@/tables/LeagueTeamsTable";
import { LeagueTeamReadyForMatchSection } from "@/components/league-team/LeagueTeamReadyForMatch";
import { useToggleOfficialLeagueTeamSection } from "@/stores/leagueTeamStores";
import { ToggleState } from "@/stores/toggleStore";
import { Spinner } from "@/components/ui/spinner";
import LeagueNotApproveYet from "@/components/LeagueNotApproveYet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useLeagueCategoriesRoundsGroups } from "@/hooks/useLeagueCategoriesRoundsGroups";
import { Suspense } from "react";

export default function LeagueTeamsPage() {
  const { state, data } = useToggleOfficialLeagueTeamSection();
  const {
    categories,
    rounds,
    isLoading,
    activeLeagueData,
    error,
    selectedCategory,
    selectedRound,
    setSelectedCategory,
    setSelectedRound,
  } = useLeagueCategoriesRoundsGroups();

  if (activeLeagueData?.status === "Pending") {
    return <LeagueNotApproveYet />;
  }

  if (isLoading) {
    return (
      <div className="h-screen grid place-content-center">
        <Spinner />
      </div>
    );
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
      <ContentHeader title="Teams" />
      <ContentBody>
        {categories.length > 0 && (
          <div className="flex items-center gap-2">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
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

            {rounds.length > 0 && (
              <Select value={selectedRound} onValueChange={setSelectedRound}>
                <SelectTrigger className="h-6 px-2 py-1 text-xs">
                  <SelectValue placeholder="Round" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  {rounds.map((r) => (
                    <SelectItem key={r.round_id} value={r.round_id}>
                      {r.round_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {state === ToggleState.SHOW_LEAGUE_TEAM && data ? (
          <LeagueTeamReadyForMatchSection data={data} />
        ) : (
          selectedCategory &&
          selectedRound && (
            <Suspense
              fallback={
                <div className="h-40 grid place-content-center">
                  <Spinner />
                </div>
              }
            >
              <LeagueTeamsTable
                leagueCategoryId={selectedCategory}
                roundId={selectedRound}
              />
            </Suspense>
          )
        )}
      </ContentBody>
    </ContentShell>
  );
}
