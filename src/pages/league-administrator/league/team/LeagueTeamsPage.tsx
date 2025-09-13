import { useEffect, useState } from "react";
import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeagueTeamsTable from "@/tables/LeagueTeamsTable";
import { LeagueTeamReadyForMatchSection } from "@/components/league-team/LeagueTeamReadyForMatch";
import { useToggleOfficialLeagueTeamSection } from "@/stores/leagueTeamStores";
import { ToggleState } from "@/stores/toggleStore";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { NoActiveLeagueAlert } from "@/components/noActiveLeagueAlert";

export default function LeagueTeamsPage() {
  const {
    activeLeagueId,
    activeLeagueData,
    activeLeagueError,
    activeLeagueCategories,
  } = useActiveLeague();

  const { state, data } = useToggleOfficialLeagueTeamSection();

  const hasActiveLeague =
    !activeLeagueError &&
    activeLeagueData &&
    activeLeagueCategories &&
    activeLeagueCategories.length > 0;

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (
      hasActiveLeague &&
      activeLeagueCategories &&
      activeLeagueCategories.length > 0
    ) {
      setActiveCategoryId(activeLeagueCategories[0].league_category_id);
    }
  }, [hasActiveLeague, activeLeagueCategories]);

  return (
    <ContentShell>
      <ContentHeader title="Official Teams" />
      <ContentBody>
        {!hasActiveLeague && <NoActiveLeagueAlert />}

        {hasActiveLeague &&
          activeLeagueCategories &&
          activeLeagueCategories.length > 0 && (
            <Tabs
              value={activeCategoryId ?? ""}
              onValueChange={setActiveCategoryId}
              className="text-sm text-muted-foreground"
            >
              <TabsList className="flex flex-wrap gap-2 mb-2">
                {activeLeagueCategories.map((category) => (
                  <TabsTrigger
                    key={category.league_category_id}
                    value={category.league_category_id}
                    className="w-[200px]"
                  >
                    {category.category_name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {activeLeagueCategories.map((category) => (
                <TabsContent
                  key={category.league_category_id}
                  value={category.league_category_id}
                >
                  {state === ToggleState.SHOW_LEAGUE_TEAM && data ? (
                    <LeagueTeamReadyForMatchSection data={data} />
                  ) : activeLeagueId ? (
                    <LeagueTeamsTable
                      leagueCategoryId={category.league_category_id}
                      leagueId={activeLeagueId}
                    />
                  ) : null}
                </TabsContent>
              ))}
            </Tabs>
          )}
      </ContentBody>
    </ContentShell>
  );
}
