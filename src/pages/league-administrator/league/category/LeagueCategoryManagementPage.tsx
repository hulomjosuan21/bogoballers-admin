import LeagueCategoryCanvas from "./LeagueCategoryManagementXYFlowCanvas";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { default as ContentHeader } from "@/components/content-header";
import { CloudAlert } from "lucide-react";
import { useLeagueCategories } from "@/hooks/useLeagueCategories";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { useMemo } from "react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
} from "@/components/ui/alert";
import { RiSpamFill } from "@remixicon/react";
import { Button } from "@/components/ui/button";
export default function LeagueCategoryManagementPage() {
  const {
    activeLeagueId,
    activeLeagueData,
    activeLeagueLoading,
    activeLeagueError,
  } = useActiveLeague();

  const {
    leagueCategoriesData,
    leagueCategoriesError,
    refetchLeagueCategories,
  } = useLeagueCategories(activeLeagueId);

  const hasActiveLeague = useMemo(() => {
    return activeLeagueData != null && Object.keys(activeLeagueData).length > 0;
  }, [activeLeagueData]);

  return (
    <>
      {!hasActiveLeague ? (
        <ContentShell>
          <ContentHeader title="Category Management"></ContentHeader>
          <ContentBody>
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
                  onClick={() => window.open("/public/about/league", "_blank")}
                >
                  Learn more
                </Button>
              </AlertToolbar>
            </Alert>
            <div className="centered-container">
              <CloudAlert />
            </div>
          </ContentBody>
        </ContentShell>
      ) : (
        <LeagueCategoryCanvas
          categories={leagueCategoriesData}
          isLoading={activeLeagueLoading}
          error={activeLeagueError ?? leagueCategoriesError}
          refetch={refetchLeagueCategories}
          viewOnly={false}
        />
      )}
    </>
  );
}
