import { useQuery } from "@tanstack/react-query";
import LeagueCategoryCanvas from "./canvas";
import {
  ContentBody,
  ContentHeader,
  ContentShell,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
  RiSpamFill,
  Button,
  useMemo,
} from "./imports";
import { CloudAlert } from "lucide-react";
import { getActiveLeagueCategoriesQueryOption } from "@/queries/leagueCategoryQueryOption";
import { getActiveLeagueQueryOption } from "@/queries/leagueQueryOption";

export default function LeagueCategoryManagementPage() {
  const {
    data: activeLeague,
    isLoading: isLoadingLeague,
    error: leagueError,
  } = useQuery(getActiveLeagueQueryOption);
  const hasActiveLeague = useMemo(() => {
    return activeLeague != null && Object.keys(activeLeague).length > 0;
  }, [activeLeague]);

  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery(getActiveLeagueCategoriesQueryOption(activeLeague?.league_id));

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
          categories={categories}
          isLoading={isLoadingLeague || isLoadingCategories}
          error={leagueError ?? categoriesError}
          refetch={refetchCategories}
          viewOnly={false}
        />
      )}
    </>
  );
}
