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

export default function LeagueMatches() {
  const {
    categories,
    rounds,
    groups,
    isLoading,
    error,
    selectedCategory,
    selectedRound,
    selectedGroup,
    setSelectedCategory,
    setSelectedRound,
    setSelectedGroup,
  } = useLeagueCategoriesRoundsGroups();

  return (
    <ContentShell>
      <ContentHeader title="League Matches" />
      <ContentBody>
        {isLoading && (
          <div className="h-screen grid place-content-center">
            <Spinner />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500">
            {(error as any)?.message || "Error loading league data"}
          </p>
        )}

        {!isLoading && !error && categories.length === 0 && (
          <p className="text-sm text-gray-500">No categories available.</p>
        )}

        {!isLoading && !error && categories.length > 0 && (
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

        <div className="">
          <span>{groups.map((g) => g.group_id).join(",")}</span>
        </div>
      </ContentBody>
    </ContentShell>
  );
}
