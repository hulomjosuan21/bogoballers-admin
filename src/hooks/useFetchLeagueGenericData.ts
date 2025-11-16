import {
  leagueService,
  type FetchLeagueGenericDataParams,
} from "@/service/leagueService";
import type { League } from "@/types/league";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useMemo } from "react";

type GenericQueryOptions<T> = Omit<
  UseQueryOptions<T, Error>,
  "queryKey" | "queryFn"
>;

export const useFetchLeagueGenericData = <T>({
  key = ["league-generic"],
  params,
  options,
}: {
  key?: string[];
  params: FetchLeagueGenericDataParams;
  options?: GenericQueryOptions<T | null>;
}) => {
  const stableParams = useMemo(() => params, [JSON.stringify(params)]);

  const queryKey = [...key, stableParams];

  const query = useQuery<T | null, Error>({
    queryKey,
    initialData: null,
    queryFn: () => leagueService.fetchGenericData<T>(stableParams),
    ...options,
  });

  const leagueId =
    query.data && typeof query.data === "object" && "league_id" in query.data
      ? (query.data as unknown as League).league_id
      : undefined;

  return {
    ...query,
    hasData: !query.isError && query.data !== null,
    leagueId,
  };
};
