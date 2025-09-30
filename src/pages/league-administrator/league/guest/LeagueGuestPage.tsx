import { useEffect, useState } from "react";
import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { NoActiveLeagueAlert } from "@/components/noActiveLeagueAlert";
import LeagueNotApproveYet from "@/components/LeagueNotApproveYet";

export default function LeagueGuestPage() {
  const { activeLeagueData, activeLeagueCategories } = useActiveLeague();

  const hasActiveLeague =
    activeLeagueData != null && Object.keys(activeLeagueData).length > 0;

  const [activeCategoryId, setActiveCategoryId] = useState<string>("");

  useEffect(() => {
    if (hasActiveLeague && activeLeagueCategories?.length) {
      setActiveCategoryId(activeLeagueCategories[0].league_category_id);
    }
  }, [hasActiveLeague, activeLeagueCategories]);

  const activeCategory = activeLeagueCategories?.find(
    (cat) => cat.league_category_id === activeCategoryId
  );

  if (activeLeagueData?.status === "Pending") {
    return <LeagueNotApproveYet />;
  }

  return (
    <ContentShell>
      <ContentHeader title="Manage League Guest" />
      <ContentBody>
        {!hasActiveLeague || !activeLeagueCategories?.length ? (
          <NoActiveLeagueAlert />
        ) : (
          <>
            <div className="flex items-center mb-2">
              <Select
                value={activeCategoryId}
                onValueChange={setActiveCategoryId}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select League Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Active League Categories</SelectLabel>
                    {activeLeagueCategories.map((cat) => (
                      <SelectItem
                        key={cat.league_category_id}
                        value={cat.league_category_id}
                      >
                        {cat.category_name ?? "Unnamed Category"}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {activeCategory && <></>}
          </>
        )}
      </ContentBody>
    </ContentShell>
  );
}
