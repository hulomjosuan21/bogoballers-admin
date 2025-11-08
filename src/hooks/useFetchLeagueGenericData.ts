import {
  leagueService,
  type FetchLeagueGenericDataParams,
} from "@/service/leagueService";
import type { League } from "@/types/league";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

type GenericQueryOptions<T> = Omit<
  UseQueryOptions<T, Error>,
  "queryKey" | "queryFn"
>;

export const useFetchLeagueGenericData = <T>({
  params,
  options,
}: {
  params: FetchLeagueGenericDataParams;
  options?: GenericQueryOptions<T | null>;
}) => {
  const queryKey = ["league-generic", JSON.stringify(params)];

  const query = useQuery<T | null, Error>({
    queryKey,

    queryFn: () => leagueService.fetchGenericData<T>(params),
    ...options,
  });

  const leagueId =
    query.data && typeof query.data === "object" && "league_id" in query.data
      ? (query.data as unknown as League).league_id
      : undefined;

  return {
    ...query,
    hasData: !query.isError && query.data !== null,
    leagueId: leagueId,
  };
};
