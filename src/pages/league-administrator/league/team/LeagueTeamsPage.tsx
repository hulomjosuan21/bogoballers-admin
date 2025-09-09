import { useMemo } from "react";
import { RiSpamFill } from "@remixicon/react";

import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ErrorLoading from "@/components/error-loading";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import LeagueTeamsTable from "@/tables/LeagueTeamsTable";
import { LeagueTeamReadyForMatchSection } from "@/components/league-team/LeagueTeamReadyForMatch";
import { useToggleOfficialLeagueTeamSection } from "@/stores/leagueTeamStores";
import { ToggleState } from "@/stores/toggleStore";
import { useLeagueCategories } from "@/hooks/useLeagueCategories";
import { useActiveLeague } from "@/hooks/useActiveLeague";

export default function LeagueTeamsPage() {
  const {
    activeLeagueId,
    activeLeagueData,
    activeLeagueLoading,
    activeLeagueError,
  } = useActiveLeague();

  const {
    leagueCategoriesData,
    leagueCategoriesLoading,
    leagueCategoriesError,
  } = useLeagueCategories(activeLeagueId);

  const hasActiveLeague = useMemo(() => {
    return activeLeagueData != null && Object.keys(activeLeagueData).length > 0;
  }, [activeLeagueData]);
  const { state, data } = useToggleOfficialLeagueTeamSection();

  return (
    <ContentShell>
      <ContentHeader title="Official Teams" />

      <ContentBody>
        {activeLeagueLoading ||
        leagueCategoriesLoading ||
        activeLeagueError ||
        leagueCategoriesError ? (
          <ErrorLoading
            isLoading={activeLeagueLoading || leagueCategoriesLoading}
            error={activeLeagueError || leagueCategoriesError}
          />
        ) : (
          <>
            {!hasActiveLeague && (
              <Alert variant="secondary">
                <AlertIcon>
                  <RiSpamFill />
                </AlertIcon>
                <AlertTitle>No active league.</AlertTitle>
                <AlertToolbar>
                  <Button
                    variant="inverse"
                    mode="link"
                    underlined="solid"
                    size="sm"
                    className="flex mt-0.5"
                    onClick={() =>
                      window.open(
                        "/about/league",
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    Learn more
                  </Button>
                </AlertToolbar>
              </Alert>
            )}

            {hasActiveLeague && leagueCategoriesData && (
              <div className="space-y-4">
                {state === ToggleState.SHOW_LEAGUE_TEAM && data ? (
                  <LeagueTeamReadyForMatchSection data={data} />
                ) : (
                  <Tabs
                    defaultValue={leagueCategoriesData[0].league_category_id}
                  >
                    <ScrollArea>
                      <TabsList className="grid grid-cols-2">
                        {leagueCategoriesData.map((cat) => (
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

                    {leagueCategoriesData.map((cat) => (
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
              </div>
            )}
          </>
        )}
      </ContentBody>
    </ContentShell>
  );
}
