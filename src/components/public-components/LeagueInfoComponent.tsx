import { useActiveLeagueCategories } from "@/hooks/useLeagueCategories";
import type { LeagueCategory } from "@/types/leagueCategoryTypes";
import { memo, useEffect, useState, Suspense, useTransition } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { LeagueTeamsPublicTable } from "@/tables/LeagueTeamsPublicTable";
import { LeagueMatchesTable } from "@/tables/LeagueMatches";

type Props = {
  leagueId: string;
};

function Component({ leagueId }: Props) {
  const { activeLeagueCategories } = useActiveLeagueCategories(leagueId);

  const [selectedCategory, setSelectedCategory] =
    useState<LeagueCategory | null>(null);

  const [activeRoundId, setActiveRoundId] = useState<string | null>(null);

  const [viewType, setViewType] = useState<"Teams" | "Match">("Teams");

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (activeLeagueCategories && activeLeagueCategories.length > 0) {
      const firstCategory = activeLeagueCategories[0];
      setSelectedCategory(firstCategory);
      setActiveRoundId(firstCategory.rounds[0]?.round_id || null);
    }
  }, [activeLeagueCategories]);

  const handleCategorySelect = (categoryId: string) => {
    const category =
      activeLeagueCategories?.find(
        (c) => c.league_category_id === categoryId
      ) || null;

    startTransition(() => {
      setSelectedCategory(category);
      setActiveRoundId(category?.rounds[0]?.round_id || null);
    });
  };

  return (
    <div className="">
      {selectedCategory ? (
        <>
          <div className="flex flex-wrap gap-2 items-center mb-2">
            {/* Toggle between Teams and Match */}
            <Select
              value={viewType}
              onValueChange={(val) => setViewType(val as "Teams" | "Match")}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Teams">Teams</SelectItem>
                <SelectItem value="Match">Match</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Selector */}
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
          </div>

          {isPending && (
            <p className="text-muted-foreground text-sm">Loading category…</p>
          )}

          <Suspense
            fallback={<p className="text-muted-foreground">Loading…</p>}
          >
            {viewType === "Teams" ? (
              <LeagueTeamsPublicTable
                key="teams"
                leagueCategoryId={selectedCategory.league_category_id}
              />
            ) : (
              <>
                {selectedCategory.rounds.length > 0 ? (
                  <>
                    <Tabs
                      value={activeRoundId || undefined}
                      onValueChange={setActiveRoundId}
                      className="text-sm text-muted-foreground"
                    >
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
                    </Tabs>

                    {activeRoundId && (
                      <div className="mt-2">
                        <LeagueMatchesTable
                          key="matches"
                          leagueCategoryId={selectedCategory.league_category_id}
                          roundId={activeRoundId}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    No rounds available for this category.
                  </p>
                )}
              </>
            )}
          </Suspense>
        </>
      ) : (
        <p className="text-muted-foreground">No category selected.</p>
      )}
    </div>
  );
}

export const LeagueInfoComponent = memo(Component);
