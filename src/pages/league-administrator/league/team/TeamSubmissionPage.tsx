import { useMemo } from "react";
import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TeamSubmissionTable } from "@/tables/LeagueTeamSubmissionTable";
import {
  LeagueTeamSheetSheetSubmissionSheet,
  RefundDialog,
} from "@/components/league-team/LeagueTeamManagementComponents";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { NoActiveLeagueAlert } from "@/components/noActiveLeagueAlert";

export default function TeamSubmissionPage() {
  const {
    activeLeagueId,
    activeLeagueData,
    activeLeagueLoading,
    activeLeagueCategories,
  } = useActiveLeague();

  const hasActiveLeague = useMemo(
    () => activeLeagueData != null && Object.keys(activeLeagueData).length > 0,
    [activeLeagueData]
  );

  const shouldShowTabs =
    hasActiveLeague && (activeLeagueCategories?.length ?? 0) > 0;

  return (
    <ContentShell>
      <ContentHeader title="Team Submission" />
      <ContentBody>
        {shouldShowTabs ? (
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
                <LeagueTeamSheetSheetSubmissionSheet />
                <RefundDialog />
                <TeamSubmissionTable
                  leagueCategoryId={cat.league_category_id}
                  leagueId={activeLeagueId}
                  isLoading={activeLeagueLoading}
                />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <NoActiveLeagueAlert />
        )}
      </ContentBody>
    </ContentShell>
  );
}
