import ContentHeader from "@/components/content-header";
import { Spinner } from "@/components/ui/spinner";
import { useLeagueCategoriesRoundsGroups } from "@/hooks/useLeagueCategoriesRoundsGroups";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import LeagueMatchStaticDisplayTable from "@/tables/LeagueMatchHistoryTable";
import { Suspense } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LeagueMatch } from "@/types/leagueMatch";
import useActiveLeagueMeta from "@/hooks/useActiveLeagueMeta";
import {
  NoActiveLeagueAlert,
  PendingLeagueAlert,
} from "@/components/LeagueStatusAlert";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axiosClient";
export const MatchHistoryFilter = ({
  label,
  categories,
  rounds,
  selectedCategory,
  selectedRound,
  setSelectedCategory,
  setSelectedRound,
}: {
  label?: string;
  categories: { league_category_id: string; category_name: string }[];
  rounds: { round_id: string; round_name: string }[];
  selectedCategory: string | undefined;
  selectedRound: string | undefined;
  setSelectedCategory: (id: string) => void;
  setSelectedRound: (id: string) => void;
}) => {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm font-medium">{label}:</span>}

      {categories.length > 0 && (
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
      )}

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
  );
};

export const LeagueMatchTableWrapper = ({
  selectedCategory,
  selectedRound,
  leagueMatchData,
  leagueMatchLoading,
  refresh,
  controlls = true,
  label,
  excludeFields,
}: {
  selectedCategory: string | undefined;
  selectedRound: string | undefined;
  leagueMatchData: Partial<LeagueMatch>[];
  leagueMatchLoading: boolean;
  refresh: () => Promise<any>;
  controlls?: boolean;
  label?: string;
  excludeFields?: (keyof LeagueMatch)[];
}) => {
  if (!selectedCategory) return null;

  return (
    <Suspense
      key={`${selectedCategory}-${selectedRound}-${label}`}
      fallback={
        <div className="h-40 grid place-content-center">
          <Spinner />
        </div>
      }
    >
      <LeagueMatchStaticDisplayTable
        key={selectedCategory}
        data={leagueMatchData ?? []}
        isLoading={leagueMatchLoading}
        refresh={refresh}
        controlls={controlls}
        label={label}
        excludeFields={excludeFields}
      />
    </Suspense>
  );
};

const MatchHistoryPage = () => {
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
    refetch: refetchLeagueMatch,
  } = useQuery({
    queryKey: ["completed-matchs", selectedCategory, selectedRound],
    queryFn: async () => {
      const response = await axiosClient.get<LeagueMatch[]>(
        `/league-match/${selectedCategory}/${selectedRound}/completed`
      );
      return response.data;
    },
    enabled: isActive,
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
      <ContentHeader title="Completed Matches" />
      <ContentBody>
        <MatchHistoryFilter
          label="Filter"
          categories={categories}
          rounds={rounds}
          selectedCategory={selectedCategory}
          selectedRound={selectedRound}
          setSelectedCategory={setSelectedCategory}
          setSelectedRound={setSelectedRound}
        />

        <LeagueMatchTableWrapper
          selectedCategory={selectedCategory}
          selectedRound={selectedRound}
          leagueMatchData={leagueMatchData ?? []}
          leagueMatchLoading={leagueMatchLoading}
          refresh={refetchLeagueMatch}
        />
      </ContentBody>
    </ContentShell>
  );
};

export default MatchHistoryPage;
