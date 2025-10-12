import LeagueCategoryCanvas from "./LeagueCategoryManagementXYFlowCanvas";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { default as ContentHeader } from "@/components/content-header";
import { Loader2, CloudAlert } from "lucide-react";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
} from "@/components/ui/alert";
import { RiSpamFill } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { useActiveLeagueCategories } from "@/hooks/useLeagueCategories";
import LeagueNotApproveYet from "@/components/LeagueNotApproveYet";

export default function LeagueCategoryManagementPage() {
  const { activeLeagueId, activeLeagueData, activeLeagueLoading } =
    useActiveLeague();

  const {
    activeLeagueCategories,
    activeLeagueCategoriesLoading,
    activeLeagueCategoriesError,
  } = useActiveLeagueCategories(activeLeagueId, {
    condition: "Automatic",
  });

  const isLoading = activeLeagueLoading || activeLeagueCategoriesLoading;

  if (isLoading) {
    return (
      <ContentShell>
        <ContentBody>
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              Loading categories...
            </p>
          </div>
        </ContentBody>
      </ContentShell>
    );
  }

  if (activeLeagueData?.status === "Pending") {
    return <LeagueNotApproveYet />;
  }

  if (!activeLeagueCategories || activeLeagueCategories.length === 0) {
    return (
      <ContentShell>
        <ContentHeader title="Automatic Configuration" />
        <ContentBody>
          <Alert variant="secondary">
            <AlertIcon>
              <RiSpamFill />
            </AlertIcon>
            <AlertTitle>No active league categories found.</AlertTitle>
            <AlertToolbar>
              <Button
                variant="inverse"
                mode="link"
                underlined="solid"
                size="sm"
                className="flex mt-0.5"
                onClick={() => window.open("/public/about/league", "_blank")}
              >
                Learn more
              </Button>
            </AlertToolbar>
          </Alert>
          <div className="flex items-center justify-center h-40">
            <CloudAlert className="w-12 h-12 text-muted-foreground" />
          </div>
        </ContentBody>
      </ContentShell>
    );
  }

  return (
    <LeagueCategoryCanvas
      leagueId={activeLeagueId}
      categories={activeLeagueCategories}
      error={activeLeagueCategoriesError}
      viewOnly={false}
    />
  );
}
