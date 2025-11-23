import { memo, useState, Suspense } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "../ui/spinner";
import { LeagueTeamsPublicTable } from "@/tables/LeagueTeamsPublicTable";
import { LeagueMatchesTable } from "@/tables/LeagueMatches";
import { useLeagueCategoriesRoundsGroups } from "@/hooks/useLeagueCategoriesRoundsGroups";

type Props = {
  publicLeagueId?: string;
};

function Component({ publicLeagueId }: Props) {
  const {
    categories,
    rounds,
    isLoading,
    selectedCategory,
    selectedRound,
    setSelectedCategory,
    setSelectedRound,
  } = useLeagueCategoriesRoundsGroups({ publicLeagueId });

  const [viewType, setViewType] = useState<"Teams" | "Match">("Teams");

  // ⛔ Prevent rendering while loading
  if (isLoading) {
    return (
      <div className="h-40 grid place-content-center">
        <Spinner />
      </div>
    );
  }

  // ⛔ No categories found
  if (!selectedCategory) {
    return <p className="text-muted-foreground">No category selected.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center mb-2">
        {/* View Selector */}
        <Select
          value={viewType}
          onValueChange={(val) => setViewType(val as "Teams" | "Match")}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Teams">Teams</SelectItem>
            <SelectItem value="Match">Match</SelectItem>
          </SelectContent>
        </Select>

        {/* Category selector */}
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

        {rounds.length > 0 && viewType != "Teams" && (
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

      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        {viewType === "Teams" ? (
          <Suspense
            key={`team-${selectedCategory}`}
            fallback={
              <div className="h-40 grid place-content-center">
                <Spinner />
              </div>
            }
          >
            <LeagueTeamsPublicTable leagueCategoryId={selectedCategory} />
          </Suspense>
        ) : selectedRound ? (
          <Suspense
            key={`match-${selectedCategory}-${selectedRound}`}
            fallback={
              <div className="h-40 grid place-content-center">
                <Spinner />
              </div>
            }
          >
            <LeagueMatchesTable
              leagueCategoryId={selectedCategory}
              roundId={selectedRound}
            />
          </Suspense>
        ) : (
          <p className="text-muted-foreground">
            No rounds available for this category.
          </p>
        )}
      </Suspense>
    </div>
  );
}

export const LeagueInfoComponent = memo(Component);
