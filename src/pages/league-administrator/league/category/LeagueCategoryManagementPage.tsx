import { useQuery } from "@tanstack/react-query";
import LeagueCategoryCanvas from "./canvas";
import { getActiveLeagueQueryOptions } from "./imports";
import { getActiveLeagueCategoriesQueryOptions } from "@/queries/league-category";

export default function LeagueCategoryManagementPage() {
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
    <LeagueCategoryCanvas
      categories={categories}
      isLoading={isLoadingLeague || isLoadingCategories}
      error={leagueError ?? categoriesError}
      refetch={refetchCategories}
      viewOnly={false}
    />
  );
}
