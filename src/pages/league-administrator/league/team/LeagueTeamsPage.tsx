import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import LeagueTeamsTable from "@/tables/LeagueTeamsTable";
import { LeagueTeamReadyForMatchSection } from "@/components/league-team/LeagueTeamReadyForMatch";
import { useToggleOfficialLeagueTeamSection } from "@/stores/leagueTeamStores";
import { ToggleState } from "@/stores/toggleStore";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useLeagueCategoriesRoundsGroups } from "@/hooks/useLeagueCategoriesRoundsGroups";
import { Suspense } from "react";
import useActiveLeagueMeta from "@/hooks/useActiveLeagueMeta";
import {
  NoActiveLeagueAlert,
  PendingLeagueAlert,
} from "@/components/LeagueStatusAlert";

export default function LeagueTeamsPage() {
  const { isActive, league_status, message } = useActiveLeagueMeta();
  const { state, data } = useToggleOfficialLeagueTeamSection();
  const { categories, selectedCategory, setSelectedCategory } =
    useLeagueCategoriesRoundsGroups();

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
          </div>
        )}

        {state === ToggleState.SHOW_LEAGUE_TEAM && data ? (
          <LeagueTeamReadyForMatchSection data={data} />
        ) : (
          selectedCategory && (
            <Suspense
              key={`${selectedCategory}`}
              fallback={
                <div className="h-40 grid place-content-center">
                  <Spinner />
                </div>
              }
            >
              <LeagueTeamsTable
                key={selectedCategory}
                leagueCategoryId={selectedCategory}
              />
            </Suspense>
          )
        )}
      </ContentBody>
    </ContentShell>
  );
}
