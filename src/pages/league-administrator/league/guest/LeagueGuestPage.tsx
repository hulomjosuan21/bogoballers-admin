import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LeagueGuestTable from "@/tables/LeagueGuestTable";
import { useLeagueCategoriesRoundsGroups } from "@/hooks/useLeagueCategoriesRoundsGroups";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import useActiveLeagueMeta from "@/hooks/useActiveLeagueMeta";
import {
  NoActiveLeagueAlert,
  PendingLeagueAlert,
} from "@/components/LeagueStatusAlert";

export default function LeagueGuestPage() {
  const { categories, selectedCategory, setSelectedCategory } =
    useLeagueCategoriesRoundsGroups();

  const { isActive, league_status, message } = useActiveLeagueMeta();

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
      <ContentHeader title="Manage League Guest" />
      <ContentBody>
        <div className="flex items-center gap-2">
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
        </div>

        <Suspense
          key={selectedCategory}
          fallback={
            <div className="h-40 grid place-content-center">
              <Spinner />
            </div>
          }
        >
          <LeagueGuestTable leagueCategoryId={selectedCategory} />
        </Suspense>
      </ContentBody>
    </ContentShell>
  );
}
