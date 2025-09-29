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
import LeagueNotApproveYet from "@/components/LeagueNotApproveYet";
import { LeaguePlayersTable } from "@/tables/LeaguePlayersTable";

export default function LeaguePlayerPage() {
  const { activeLeagueData, activeLeagueError, activeLeagueCategories } =
    useActiveLeague();

  const hasActiveLeague =
    !activeLeagueError &&
    activeLeagueData &&
    activeLeagueCategories &&
    activeLeagueCategories.length > 0;

  const [selectedCategory, setSelectedCategory] =
    useState<LeagueCategory | null>(null);

  useEffect(() => {
    if (hasActiveLeague && activeLeagueCategories.length > 0) {
      const firstCategory = activeLeagueCategories[0];
      setSelectedCategory(firstCategory);
    }
  }, [hasActiveLeague, activeLeagueCategories]);

  const handleCategorySelect = (categoryId: string) => {
    const category =
      activeLeagueCategories?.find(
        (c) => c.league_category_id === categoryId
      ) || null;
    setSelectedCategory(category);
  };

  if (activeLeagueData?.status === "Pending") {
    return <LeagueNotApproveYet />;
  }

  return (
    <ContentShell>
      <ContentHeader title="League Players" />
      <ContentBody>
        {hasActiveLeague ? (
          <>
            {selectedCategory && (
              <Tabs
                className="text-sm text-muted-foreground"
                defaultValue="all"
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
                    <TabsTrigger value="all" className="w-[175px]">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="request" className="w-[175px]">
                      Request
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="all">
                  <LeaguePlayersTable
                    leagueCategoryId={selectedCategory.league_category_id}
                  />
                </TabsContent>
                <TabsContent value="request"></TabsContent>
              </Tabs>
            )}
          </>
        ) : (
          <NoActiveLeagueAlert />
        )}
      </ContentBody>
    </ContentShell>
  );
}
