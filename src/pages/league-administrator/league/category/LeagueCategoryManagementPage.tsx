import { useQuery } from "@tanstack/react-query";
import LeagueCategoryCanvas from "./canvas";
import { getActiveLeagueQueryOptions } from "./imports";

export default function LeagueCategoryManagementPage() {
  const { data, isLoading, error, refetch } = useQuery(
    getActiveLeagueQueryOptions
  );

  return (
    <LeagueCategoryCanvas
      categories={data?.categories}
      isLoading={isLoading}
      error={error}
      refetch={refetch}
      viewOnly={false}
    />
  );
}
