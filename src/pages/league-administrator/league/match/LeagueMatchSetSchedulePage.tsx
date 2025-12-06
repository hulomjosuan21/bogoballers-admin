import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useLeagueCategoriesRoundsGroups } from "@/hooks/useLeagueCategoriesRoundsGroups";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import { UnscheduleMatchTable } from "@/tables/LeagueMatchUnscheduledTable";
import { useQuery } from "@tanstack/react-query";
import { leagueMatchService } from "@/service/leagueMatchService";
import useActiveLeagueMeta from "@/hooks/useActiveLeagueMeta";
import {
  NoActiveLeagueAlert,
  PendingLeagueAlert,
} from "@/components/LeagueStatusAlert";

export default function LeagueMatchSetUnSchedulePage() {
  const { league_status, isActive, message } = useActiveLeagueMeta();

  const {
    categories,
    rounds,
    selectedCategory,
    selectedRound,
    setSelectedCategory,
    setSelectedRound,
  } = useLeagueCategoriesRoundsGroups();

  const {
    data: leagueMatchData,
    isLoading: leagueMatchLoading,
    error: leagueMatchError,
    refetch: refetchLeagueMatch,
  } = useQuery({
    queryKey: ["unscheduled-matches", selectedCategory, selectedRound],
    queryFn: () =>
      leagueMatchService.fetchUnscheduled(selectedCategory, selectedRound),
    enabled: !!selectedCategory && !!selectedRound,
  });

  if (!isActive) {
    return (
      <NoActiveLeagueAlert message={message ?? "No active league found."} />
    );
  }

  if (isActive && league_status === "Pending") {
    return <PendingLeagueAlert />;
  }

  return (
    <ContentShell>
      <ContentHeader title="Set Schedule" />
      <ContentBody>
        {categories.length > 0 && (
          <div className="flex items-center gap-2">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="h-6 px-2 py-1 text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                {categories.map((c) => (
                  <SelectItem
                    key={c.league_category_id}
                    value={c.league_category_id}
                  >
                    {c.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {rounds.length > 0 && (
              <Select value={selectedRound} onValueChange={setSelectedRound}>
                <SelectTrigger className="h-6 px-2 py-1 text-xs">
                  <SelectValue placeholder="Round" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  {rounds.map((r) => (
                    <SelectItem key={r.round_id} value={r.round_id}>
                      {r.round_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {selectedCategory && selectedRound && (
          <Suspense
            key={`${selectedCategory}-${selectedRound}`}
            fallback={
              <div className="h-40 grid place-content-center">
                <Spinner />
              </div>
            }
          >
            <UnscheduleMatchTable
              key={selectedCategory}
              leagueMatchData={leagueMatchData ?? []}
              leagueMatchLoading={leagueMatchLoading}
              leagueMatchError={leagueMatchError}
              refetchLeagueMatch={refetchLeagueMatch}
            />
          </Suspense>
        )}
      </ContentBody>
    </ContentShell>
  );
}
