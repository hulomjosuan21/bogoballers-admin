import { useEffect, useState } from "react";
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
  const { activeLeagueId, activeLeagueData, activeLeagueCategories } =
    useActiveLeague();

  const hasActiveLeague =
    activeLeagueData != null && Object.keys(activeLeagueData).length > 0;

  const [activeCategoryId, setActiveCategoryId] = useState<string>("");

  useEffect(() => {
    if (hasActiveLeague && activeLeagueCategories?.length) {
      setActiveCategoryId(activeLeagueCategories[0].league_category_id);
    }
  }, [hasActiveLeague, activeLeagueCategories]);

  return (
    <ContentShell>
      <ContentHeader title="Team Submission" />
      <ContentBody>
        {!hasActiveLeague || !activeLeagueCategories?.length ? (
          <NoActiveLeagueAlert />
        ) : (
          <Tabs
            value={activeCategoryId}
            onValueChange={setActiveCategoryId}
            className="text-sm text-muted-foreground"
          >
            <ScrollArea>
              <TabsList className="flex gap-2 mb-2">
                {activeLeagueCategories.map((cat) => (
                  <TabsTrigger
                    key={cat.league_category_id}
                    value={cat.league_category_id}
                    className="w-[200px]"
                  >
                    {cat.category_name ?? "Unnamed Category"}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {activeLeagueCategories.map((cat) => (
              <TabsContent
                key={cat.league_category_id}
                value={cat.league_category_id}
              >
                <LeagueTeamSheetSheetSubmissionSheet />
                <RefundDialog />
                <TeamSubmissionTable
                  leagueCategoryId={cat.league_category_id}
                  leagueId={activeLeagueId}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </ContentBody>
    </ContentShell>
  );
}
