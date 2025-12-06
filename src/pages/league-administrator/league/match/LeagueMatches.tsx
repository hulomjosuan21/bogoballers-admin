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
import { Suspense, useEffect, useState } from "react";
import {
  useToggleMatchBookSection,
  useToggleUpcomingMatchSection,
} from "@/stores/matchStore";
import { ToggleState } from "@/stores/toggleStore";
import FinalizaMatchSection from "@/components/FinalizeMatch";
import type { LeagueCourt, LeagueReferee } from "@/types/league";
import ScheduleMatchTable from "@/tables/LeagueMatchUpcomingTable";
import { SetupSelectedMatch } from "./SetupSelectedMatch";
import { LeagueService } from "@/service/leagueService";
import { useQuery } from "@tanstack/react-query";
import { leagueMatchService } from "@/service/leagueMatchService";
import {
  NoActiveLeagueAlert,
  PendingLeagueAlert,
} from "@/components/LeagueStatusAlert";
import useActiveLeagueMeta from "@/hooks/useActiveLeagueMeta";

export default function LeagueMatches() {
  const { league_status, isActive, message } = useActiveLeagueMeta();

  const {
    categories,
    rounds,
    selectedCategory,
    selectedRound,
    setSelectedCategory,
    setSelectedRound,
  } = useLeagueCategoriesRoundsGroups();

  const { data: activeLeagueData } = useQuery({
    queryKey: ["active-league-data"],
    queryFn: () => LeagueService.fetchActive(),
    enabled: true,
  });

  useEffect(() => {
    if (rounds.length > 0) {
      const isCurrentRoundValid = rounds.some(
        (r) => r.round_id === selectedRound
      );

      if (!isCurrentRoundValid) {
        setSelectedRound(rounds[0].round_id);
      }
    }
  }, [rounds, selectedRound, setSelectedRound]);

  const [refereesOption, setRefereesOption] = useState<LeagueReferee[]>([]);
  const [courtOption, setCourtOption] = useState<LeagueCourt[]>([]);

  const {
    data: leagueMatchData,
    isLoading: leagueMatchLoading,
    refetch: refetchLeagueMatch,
  } = useQuery({
    queryKey: ["scheduled-matches", selectedCategory, selectedRound],
    queryFn: () =>
      leagueMatchService.fetchScheduled(selectedCategory, selectedRound),
    enabled: !!selectedCategory && !!selectedRound,
  });

  const { state: stateMatchBook, data: selectedMatchBookData } =
    useToggleMatchBookSection();
  const { state: stateUpcomingMatch, data: selectedUpcomingMatchData } =
    useToggleUpcomingMatchSection();

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
      <ContentHeader title="League Matches" />
      <ContentBody>
        {selectedCategory && selectedRound && (
          <Suspense
            key={`${selectedCategory}-${selectedRound}`}
            fallback={
              <div className="h-40 grid place-content-center">
                <Spinner />
              </div>
            }
          >
            {stateMatchBook == ToggleState.SHOW_SAVED_MATCH &&
            selectedMatchBookData ? (
              <FinalizaMatchSection match={selectedMatchBookData} />
            ) : stateUpcomingMatch === ToggleState.CONFIG_UPCOMING &&
              selectedUpcomingMatchData ? (
              <SetupSelectedMatch
                selectedMatch={selectedUpcomingMatchData}
                refereesOption={refereesOption}
                courtOption={courtOption}
              />
            ) : (
              <>
                {categories.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedCategory}
                      onValueChange={(val) => {
                        setSelectedCategory(val);
                        setSelectedRound("");
                      }}
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
                      <Select
                        value={selectedRound}
                        onValueChange={setSelectedRound}
                      >
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
                <ScheduleMatchTable
                  leagueMatchData={leagueMatchData ?? []}
                  leagueMatchLoading={leagueMatchLoading}
                  refetchLeagueMatch={refetchLeagueMatch}
                />
              </>
            )}
          </Suspense>
        )}
      </ContentBody>
    </ContentShell>
  );
}
