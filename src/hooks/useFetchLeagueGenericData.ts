import {
  leagueService,
  type FetchLeagueGenericDataParams,
} from "@/service/leagueService";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

type GenericQueryOptions<T> = Omit<
  UseQueryOptions<T, Error>,
  "queryKey" | "queryFn"
>;

export const useFetchLeagueGenericData = <T>(
  queryKeyBase: string,
  params: FetchLeagueGenericDataParams,
  options?: GenericQueryOptions<T>
) => {
  const queryKey = [queryKeyBase, params];

  return useQuery<T, Error>({
    queryKey: queryKey,

    queryFn: () => leagueService.fetchLeagueGenericData<T>(params),
    ...options,
  });
};
