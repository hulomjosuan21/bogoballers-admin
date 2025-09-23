import { useState, useEffect } from "react";
import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import type { LeagueCategory } from "@/types/leagueCategoryTypes";
import { NoActiveLeagueAlert } from "@/components/noActiveLeagueAlert";
import { UpcomingMatchTable } from "@/tables/LeagueMatchUpcomingTable";
import { useToggleMatchBookSection } from "@/stores/matchStore";
import { ToggleState } from "@/stores/toggleStore";
import FinalizaMatchSection from "@/components/FinalizeMatch";
import LeagueNotApproveYet from "@/components/LeagueNotApproveYet";

export default function LeagueMatchCompletedPage() {
  const { activeLeagueData, activeLeagueError, activeLeagueCategories } =
    useActiveLeague();

  const hasActiveLeague =
    !activeLeagueError &&
    activeLeagueData &&
    activeLeagueCategories &&
    activeLeagueCategories.length > 0;

  const [selectedCategory, setSelectedCategory] =
    useState<LeagueCategory | null>(null);
  const [activeRoundId, setActiveRoundId] = useState<string | null>(null);

  const { state, data: selectMatch } = useToggleMatchBookSection();

  useEffect(() => {
    if (
      hasActiveLeague &&
      activeLeagueCategories &&
      activeLeagueCategories.length > 0
    ) {
      const firstCategory = activeLeagueCategories[0];
      setSelectedCategory(firstCategory);
      setActiveRoundId(firstCategory.rounds[0]?.round_id || null);
    }
  }, [hasActiveLeague, activeLeagueCategories]);

  const handleCategorySelect = (categoryId: string) => {
    const category =
      activeLeagueCategories?.find(
        (c) => c.league_category_id === categoryId
      ) || null;
    setSelectedCategory(category);
    setActiveRoundId(category?.rounds[0]?.round_id || null);
  };

  if (activeLeagueData?.status == "Pending") {
    return <LeagueNotApproveYet />;
  }

  return (
    <ContentShell>
      <ContentHeader
        title={
          selectMatch
            ? `${selectMatch.home_team.team_name} vs ${selectMatch.away_team.team_name}`
            : "Upcoming"
        }
      />
      <ContentBody>
        {hasActiveLeague ? (
          state === ToggleState.SHOW_SAVED_MATCH && selectMatch ? (
            <FinalizaMatchSection match={selectMatch} />
          ) : (
            <>
              {selectedCategory && selectedCategory.rounds.length > 0 && (
                <Tabs
                  value={activeRoundId || undefined}
                  onValueChange={setActiveRoundId}
                  className="text-sm text-muted-foreground"
                >
                  <div className="flex flex-wrap gap-2 items-center mb-2">
                    <Select
                      onValueChange={handleCategorySelect}
                      value={selectedCategory?.league_category_id || ""}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select League Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Active League Categories</SelectLabel>
                          {activeLeagueCategories?.map((category) => (
                            <SelectItem
                              key={category.league_category_id}
                              value={category.league_category_id}
                            >
                              {category.category_name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <TabsList className="flex flex-wrap gap-2">
                      {selectedCategory?.rounds.map((round) => (
                        <TabsTrigger
                          key={round.round_id}
                          value={round.round_id}
                          className="w-[175px]"
                        >
                          {round.round_name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  {selectedCategory?.rounds.map((round) => (
                    <TabsContent key={round.round_id} value={round.round_id}>
                      <UpcomingMatchTable
                        leagueCategoryId={selectedCategory.league_category_id}
                        roundId={round.round_id}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </>
          )
        ) : (
          <NoActiveLeagueAlert />
        )}
      </ContentBody>
    </ContentShell>
  );
}
