import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useLeagueCategoriesRoundsGroups } from "@/hooks/useLeagueCategoriesRoundsGroups";
import LeagueNotApproveYet from "@/components/LeagueNotApproveYet";
import { Suspense, useEffect, useState } from "react";
import { useLeagueMatch } from "@/hooks/leagueMatch";
import { useToggleMatchBookSection } from "@/stores/matchStore";
import { ToggleState } from "@/stores/toggleStore";
import FinalizaMatchSection from "@/components/FinalizeMatch";
import type { LeagueCourt, LeagueReferee } from "@/types/league";
import ScheduleMatchTable from "@/tables/LeagueMatchUpcomingTable";

export default function LeagueMatches() {
  const {
    categories,
    rounds,
    isLoading,
    activeLeagueData,
    selectedCategory,
    selectedRound,
    setSelectedCategory,
    setSelectedRound,
  } = useLeagueCategoriesRoundsGroups();

  const [refereesOption, setRefereesOption] = useState<LeagueReferee[]>([]);
  const [courtOption, setCourtOption] = useState<LeagueCourt[]>([]);

  const { leagueMatchData, leagueMatchLoading, refetchLeagueMatch } =
    useLeagueMatch(selectedCategory, selectedRound, {
      condition: "Scheduled",
    });

  const { state, data: selectMatch } = useToggleMatchBookSection();

  useEffect(() => {
    const referees = (activeLeagueData?.league_referees ?? []).filter(
      (ref) => ref.is_available
    );

    const courts = (activeLeagueData?.league_courts ?? []).filter(
      (court) => court.is_available
    );

    setRefereesOption(referees);
    setCourtOption(courts);
  }, [activeLeagueData]);

  if (activeLeagueData?.status == "Pending") {
    return <LeagueNotApproveYet />;
  }

  if (isLoading) {
    return (
      <div className="h-screen grid place-content-center">
        <Spinner />
      </div>
    );
  }

  return (
    <ContentShell>
      <ContentHeader title="League Matches" />
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
            {state === ToggleState.SHOW_SAVED_MATCH && selectMatch ? (
              <FinalizaMatchSection match={selectMatch} />
            ) : (
              <ScheduleMatchTable
                leagueMatchData={leagueMatchData ?? []}
                leagueMatchLoading={leagueMatchLoading}
                refetchLeagueMatch={refetchLeagueMatch}
                refereesOption={refereesOption}
                courtOption={courtOption}
              />
            )}
          </Suspense>
        )}
      </ContentBody>
    </ContentShell>
  );
}
