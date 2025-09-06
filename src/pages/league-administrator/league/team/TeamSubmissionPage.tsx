import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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

import { getActiveLeagueQueryOption } from "@/queries/leagueQueryOption";
import { getActiveLeagueCategoriesQueryOption } from "@/queries/leagueCategoryQueryOption";

import { TeamSubmissionTable } from "./submission-table";
import { CheckPlayerSheet } from "./components";

export default function TeamSubmissionPage() {
  const {
    data: activeLeague,
    isLoading,
    error,
  } = useQuery(getActiveLeagueQueryOption);

  const { data: categories, isLoading: isLoadingCategories } = useQuery(
    getActiveLeagueCategoriesQueryOption(activeLeague?.league_id)
  );

  const hasActiveLeague = useMemo(() => {
    return activeLeague != null && Object.keys(activeLeague).length > 0;
  }, [activeLeague]);

  if (!categories || categories.length === 0) {
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
      <ContentHeader title="Team Submission" />

      <ContentBody>
        {isLoading || error ? (
          <ErrorLoading isLoading={isLoading} error={error} />
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
              <Tabs defaultValue={categories[0].league_category_id}>
                <ScrollArea>
                  <TabsList className="text-foreground mb-3 h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1 w-full justify-start">
                    {categories.map((cat) => (
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

                {categories.map((cat) => (
                  <TabsContent
                    key={cat.league_category_id}
                    value={cat.league_category_id}
                    className="pt-2"
                  >
                    <CheckPlayerSheet />
                    <TeamSubmissionTable
                      leagueCategoryId={cat.league_category_id}
                      leagueId={activeLeague?.league_id}
                      isLoading={isLoadingCategories}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </>
        )}
      </ContentBody>
    </ContentShell>
  );
}
