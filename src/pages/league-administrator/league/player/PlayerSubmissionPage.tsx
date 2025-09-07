import { useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLeagueCategories } from "@/hooks/useLeagueCategories";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function PlayerSubmissionPage() {
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

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const hasActiveLeague = useMemo(() => {
    return activeLeagueData != null && Object.keys(activeLeagueData).length > 0;
  }, [activeLeagueData]);

  if (!leagueCategoriesData || leagueCategoriesData.length === 0) {
    return (
      <ContentShell>
        <ContentHeader title="Team Submission" />
        <ContentBody>
          <div className="centered-container">
            <p className="text-muted-foreground text-sm">
              No categories available.
            </p>
          </div>
        </ContentBody>
      </ContentShell>
    );
  }

  return (
    <ContentShell>
      <ContentHeader title={`${activeLeagueData?.league_title} Players`} />

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

            {hasActiveLeague && (
              <Tabs
                defaultValue="all"
                className="text-sm text-muted-foreground"
              >
                <ScrollArea>
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="request">Request</TabsTrigger>
                  </TabsList>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>

                <TabsContent value="all" className="space-y-2">
                  <div className="flex items-center justify-end">
                    <Select
                      onValueChange={(val) => setSelectedCategory(val)}
                      defaultValue={leagueCategoriesData[0].league_category_id}
                    >
                      <SelectTrigger size="sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>League Categories</SelectLabel>
                          {leagueCategoriesData.map((cat) => (
                            <SelectItem
                              key={cat.league_category_id}
                              value={cat.league_category_id}
                            >
                              {cat.category_name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="">
                    {leagueCategoriesData.map(
                      (cat) =>
                        cat.league_category_id === selectedCategory && (
                          <p
                            key={cat.league_category_id}
                            className="text-sm text-muted-foreground"
                          >
                            Showing data for <b>{cat.category_name}</b>
                          </p>
                        )
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="request">guest</TabsContent>
              </Tabs>
            )}
          </>
        )}
      </ContentBody>
    </ContentShell>
  );
}
