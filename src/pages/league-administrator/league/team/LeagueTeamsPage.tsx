import { useMemo } from "react";
import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
    activeLeagueLoading,
    activeLeagueCategories,
  } = useActiveLeague();

  const { state, data } = useToggleOfficialLeagueTeamSection();

  const hasActiveLeague = useMemo(
    () => activeLeagueData != null && Object.keys(activeLeagueData).length > 0,
    [activeLeagueData]
  );

  const shouldShowTabs =
    hasActiveLeague && (activeLeagueCategories?.length ?? 0) > 0;

  return (
    <ContentShell>
      <ContentHeader title="Official Teams" />
      <ContentBody>
        {!shouldShowTabs ? (
          <NoActiveLeagueAlert />
        ) : state === ToggleState.SHOW_LEAGUE_TEAM && data ? (
          <LeagueTeamReadyForMatchSection data={data} />
        ) : (
          <Tabs
            defaultValue={activeLeagueCategories?.[0]?.league_category_id}
            className="text-sm text-muted-foreground"
          >
            <ScrollArea>
              <TabsList className="grid grid-cols-2">
                {activeLeagueCategories?.map((cat) => (
                  <TabsTrigger
                    key={cat.league_category_id}
                    value={cat.league_category_id}
                  >
                    {cat.category_name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {activeLeagueCategories?.map((cat) => (
              <TabsContent
                key={cat.league_category_id}
                value={cat.league_category_id}
                className="pt-2"
              >
                <LeagueTeamsTable
                  leagueCategoryId={cat.league_category_id}
                  leagueId={activeLeagueId}
                  isLoading={activeLeagueLoading}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </ContentBody>
    </ContentShell>
  );
}
