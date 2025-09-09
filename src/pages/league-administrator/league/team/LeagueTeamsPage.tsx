import { useMemo } from "react";
import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import LeagueTeamsTable from "@/tables/LeagueTeamsTable";
import { LeagueTeamReadyForMatchSection } from "@/components/league-team/LeagueTeamReadyForMatch";
import { useToggleOfficialLeagueTeamSection } from "@/stores/leagueTeamStores";
import { ToggleState } from "@/stores/toggleStore";
import { useLeagueCategories } from "@/hooks/useLeagueCategories";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { NoActiveLeagueAlert } from "@/components/noActiveLeagueAlert";

export default function LeagueTeamsPage() {
  const { activeLeagueId, activeLeagueData } = useActiveLeague();

  const { leagueCategoriesData, leagueCategoriesLoading } =
    useLeagueCategories(activeLeagueId);

  const { state, data } = useToggleOfficialLeagueTeamSection();

  const hasActiveLeague = useMemo(
    () => activeLeagueData != null && Object.keys(activeLeagueData).length > 0,
    [activeLeagueData]
  );

  const shouldShowTabs =
    hasActiveLeague && (leagueCategoriesData?.length ?? 0) > 0;

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
            defaultValue={leagueCategoriesData?.[0]?.league_category_id}
            className="text-sm text-muted-foreground"
          >
            <ScrollArea>
              <TabsList className="grid grid-cols-2">
                {leagueCategoriesData?.map((cat) => (
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

            {leagueCategoriesData?.map((cat) => (
              <TabsContent
                key={cat.league_category_id}
                value={cat.league_category_id}
                className="pt-2"
              >
                <LeagueTeamsTable
                  leagueCategoryId={cat.league_category_id}
                  leagueId={activeLeagueId}
                  isLoading={leagueCategoriesLoading}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </ContentBody>
    </ContentShell>
  );
}
