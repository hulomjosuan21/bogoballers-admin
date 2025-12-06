import axiosClient from "@/lib/axiosClient";
import { useSuspenseQuery } from "@tanstack/react-query";

type ActiveLeagueResponse =
  | { league_id: string; status: string }
  | { message: string };

const useActiveLeagueMeta = () => {
  const query = useSuspenseQuery({
    queryKey: ["active-league-meta"],
    queryFn: async () => {
      const res = await axiosClient.get<ActiveLeagueResponse | null>(
        "/league/active-meta"
      );
      return res.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const data = query.data;

  const isActive =
    data !== null && typeof data === "object" && "league_id" in data;

  const league = isActive ? data : null;
  const message = !isActive
    ? (data as any)?.message ?? "No active league found."
    : null;

  return {
    ...query,
    isActive,
    league_id: league?.league_id,
    league_status: league?.status,
    refresh: query.refetch,
    message,
  };
};

//   const { isActive, league_id, message } = useActiveLeagueMeta();

// if (!isActive) {
//   return (
//       <NoActiveLeagueAlert message={message ?? "No active league found."} />
//   );
// }

// if (isActive && league_status === "Pending") {
//   return (
//       <PendingLeagueAlert />
//   );
// }

export default useActiveLeagueMeta;
