import { useQuery } from "@tanstack/react-query";
import LeagueCategoryCanvas from "./canvas";
import {
  ContentBody,
  ContentHeader,
  ContentShell,
  getActiveLeagueQueryOptions,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
  RiSpamFill,
  Button,
} from "./imports";
import { getActiveLeagueCategoriesQueryOptions } from "@/queries/league-category";
import { useNavigate } from "react-router-dom";
import { CloudAlert } from "lucide-react";

export default function LeagueCategoryManagementPage() {
  const navigate = useNavigate();
  const {
    data: activeLeague,
    isLoading: isLoadingLeague,
    error: leagueError,
  } = useQuery(getActiveLeagueQueryOptions);

  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery(getActiveLeagueCategoriesQueryOptions(activeLeague?.league_id));

  return (
    <>
      {!activeLeague ? (
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
                  onClick={() => navigate("/public/about/league")}
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
