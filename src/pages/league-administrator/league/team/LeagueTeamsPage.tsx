import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeagueTeamsTable from "@/tables/LeagueTeamsTable";
import { LeagueTeamReadyForMatchSection } from "@/components/league-team/LeagueTeamReadyForMatch";
import { useToggleOfficialLeagueTeamSection } from "@/stores/leagueTeamStores";
import { ToggleState } from "@/stores/toggleStore";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { NoActiveLeagueAlert } from "@/components/noActiveLeagueAlert";
import LeagueNotApproveYet from "@/components/LeagueNotApproveYet";
import type { LeagueCategory } from "@/types/leagueCategoryTypes";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LeagueTeamsPage() {
  const { state, data } = useToggleOfficialLeagueTeamSection();

  const {
    activeLeagueData,
    activeLeagueError,
    activeLeagueCategories,
    activeLeagueLoading,
  } = useActiveLeague();

  const hasActiveLeague =
    !activeLeagueError &&
    !!activeLeagueData &&
    !!activeLeagueCategories &&
    activeLeagueCategories.length > 0;

  const [selectedCategory, setSelectedCategory] = useState<
    LeagueCategory | undefined
  >(undefined);

  const [activeRoundId, setActiveRoundId] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (hasActiveLeague && activeLeagueCategories.length > 0) {
      const firstCategory = activeLeagueCategories[0];
      setSelectedCategory(firstCategory);

      if (firstCategory.rounds.length > 0) {
        setActiveRoundId(firstCategory.rounds[0].round_id);
      } else {
        setActiveRoundId(undefined);
      }
    }
  }, [hasActiveLeague, activeLeagueCategories]);

  const handleCategorySelect = (categoryId: string) => {
    const category = activeLeagueCategories.find(
      (c) => c.league_category_id === categoryId
    );
    setSelectedCategory(category);

    if (category?.rounds.length) {
      setActiveRoundId(category.rounds[0].round_id);
    } else {
      setActiveRoundId(undefined);
    }
  };

  if (activeLeagueData?.status === "Pending") {
    return <LeagueNotApproveYet />;
  }

  return (
    <ContentShell>
      <ContentHeader title="Teams" />
      <ContentBody>
        {activeLeagueLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : state === ToggleState.SHOW_LEAGUE_TEAM && data ? (
          <LeagueTeamReadyForMatchSection data={data} />
        ) : hasActiveLeague ? (
          selectedCategory ? (
            <Tabs
              value={activeRoundId}
              onValueChange={setActiveRoundId}
              className="text-sm text-muted-foreground"
            >
              <div className="flex flex-wrap gap-2 items-center mb-2">
                <Select
                  onValueChange={handleCategorySelect}
                  value={selectedCategory.league_category_id}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select League Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Active League Categories</SelectLabel>
                      {activeLeagueCategories.map((category) => (
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
                  {selectedCategory.rounds.map((round) => (
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

              {selectedCategory.rounds.length > 0 ? (
                selectedCategory.rounds.map((round) => (
                  <TabsContent key={round.round_id} value={round.round_id}>
                    <LeagueTeamsTable
                      leagueCategoryId={selectedCategory.league_category_id}
                      roundId={round.round_id}
                    />
                  </TabsContent>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No rounds available for this category.
                </p>
              )}
            </Tabs>
          ) : (
            <p className="text-muted-foreground">No category selected.</p>
          )
        ) : (
          <NoActiveLeagueAlert />
        )}
      </ContentBody>
    </ContentShell>
  );
}
