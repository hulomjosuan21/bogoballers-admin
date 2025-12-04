import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import LeagueNotApproveYet from "@/components/LeagueNotApproveYet";
import { useLeagueCategoriesRoundsGroups } from "@/hooks/useLeagueCategoriesRoundsGroups";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import { UnscheduleMatchTable } from "@/tables/LeagueMatchUnscheduledTable";
import { useLeagueMatch } from "@/hooks/leagueMatch";

export default function LeagueMatchSetUnSchedulePage() {
  const {
    categories,
    rounds,
    activeLeagueStatus,
    isLoading,
    error,
    selectedCategory,
    selectedRound,
    setSelectedCategory,
    setSelectedRound,
  } = useLeagueCategoriesRoundsGroups();

  const {
    leagueMatchData,
    leagueMatchLoading,
    leagueMatchError,
    refetchLeagueMatch,
  } = useLeagueMatch(selectedCategory, selectedRound, {
    condition: "Unscheduled",
  });

  if (activeLeagueStatus === "Pending") {
    return <LeagueNotApproveYet />;
  }

  if (isLoading) {
    return (
      <div className="h-screen grid place-content-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen grid place-content-center">
        <p className="text-sm text-red-500">
          {error.message || "Error loading match"}
        </p>
      </div>
    );
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
              leagueMatchData={leagueMatchData}
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
