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

import { useLeagueCategories } from "@/hooks/useLeagueCategories";
import { useActiveLeague } from "@/hooks/useActiveLeague";

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
              <Tabs defaultValue={leagueCategoriesData[0].league_category_id}>
                <ScrollArea>
                  <TabsList className="text-foreground mb-3 h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1 w-full justify-start">
                    {leagueCategoriesData.map((cat) => (
                      <TabsTrigger
                        key={cat.league_category_id}
                        value={cat.league_category_id}
                        className="tab-trigger"
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
                  ></TabsContent>
                ))}
              </Tabs>
            )}
          </>
        )}
      </ContentBody>
    </ContentShell>
  );
}
