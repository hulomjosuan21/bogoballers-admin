import ContentHeader from "@/components/content-header";
import { ImageZoom } from "@/components/ui/kibo-ui/image-zoom";
import {
  Status,
  StatusIndicator,
  StatusLabel,
} from "@/components/ui/kibo-ui/status";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProfitAreaChart } from "@/charts/DashboardProfitChart";
import {
  SendToBack,
  UserRound,
  UsersRound,
  type LucideIcon,
  EyeOff,
  Eye,
  Trophy,
  ArrowUpRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useActiveLeagueAnalytics } from "@/hooks/useActiveLeague";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useNavigate } from "react-router-dom";
import type { League } from "@/types/league";
import { Spinner } from "@/components/ui/spinner";
import { SelectedMatchAlert } from "@/tables/LeagueMatchUpcomingTable";
import { useSelectedMatchStore } from "@/stores/selectedMatchStore";
import {
  MatchHistoryFilter,
  LeagueMatchTableWrapper,
} from "./league/match/MatchHistoryPage";
import { useLeagueCategoriesRoundsGroups } from "@/hooks/useLeagueCategoriesRoundsGroups";
import { useQueries } from "@tanstack/react-query";
import { getLeagueMatchQueryOption } from "@/queries/leagueMatchQueryOption";
import { useFetchLeagueGenericData } from "@/hooks/useFetchLeagueGenericData";

interface DashboardCardProps {
  title: string;
  value: number | string;
  lastUpdate?: string | null;
  icon?: LucideIcon;
}

const LeagueSection = ({ league, wrap }: { league: League; wrap: boolean }) => {
  const leagueStatus = (status: string) => {
    const map: Record<
      string,
      {
        status: "online" | "offline" | "degraded" | "maintenance";
        label: string;
      }
    > = {
      Scheduled: { status: "maintenance", label: "Scheduled" },
      Ongoing: { status: "online", label: "Ongoing" },
      Completed: { status: "degraded", label: "Completed" },
      Postponed: { status: "offline", label: "Postponed" },
      Cancelled: { status: "offline", label: "Cancelled" },
      Pending: { status: "offline", label: "Pending" },
    };
    const s = map[status];
    return (
      s && (
        <Status status={s.status}>
          <StatusIndicator />
          <StatusLabel>{s.label}</StatusLabel>
        </Status>
      )
    );
  };

  return (
    <section>
      <div
        className={`grid gap-4 items-start ${
          wrap ? "grid-cols-1" : "sm:grid-cols-1 lg:grid-cols-2"
        }`}
      >
        <ImageZoom>
          <img
            src={league.banner_url}
            alt="activeleague-banner"
            className="max-h-96 w-full rounded-md object-cover"
          />
        </ImageZoom>

        <div className="flex flex-col gap-3 items-center text-center lg:items-start lg:text-left">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 my-2">
            <h1 className="text-lg font-semibold break-words">
              {league.league_title}
            </h1>
            {leagueStatus(league.status!)}
          </div>
          <p className="text-muted-foreground text-sm text-justify break-words">
            {league.league_description}
          </p>
        </div>
      </div>
    </section>
  );
};

const AnalyticsCard = ({
  title,
  value,
  lastUpdate,
  icon: Icon,
}: DashboardCardProps) => (
  <Card className="rounded-md flex-1 min-w-72">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {lastUpdate !== undefined && (
        <p className="text-xs text-muted-foreground">
          {lastUpdate
            ? `Last update: ${new Date(lastUpdate).toLocaleDateString()}`
            : "No updates yet"}
        </p>
      )}
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const {
    leagueId: activeLeagueId,
    data: activeLeagueData,
    isLoading: activeLeagueLoading,
  } = useFetchLeagueGenericData<League>({
    params: { active: true, status: ["Scheduled", "Ongoing"] },
  });

  const {
    categories,
    rounds,
    selectedCategory,
    selectedRound,
    setSelectedCategory,
    setSelectedRound,
  } = useLeagueCategoriesRoundsGroups();

  const [upcomingMatch, completedMatch] = useQueries({
    queries: [
      getLeagueMatchQueryOption(selectedCategory, selectedRound, {
        condition: "Upcoming",
        limit: 5,
      }),
      getLeagueMatchQueryOption(selectedCategory, selectedRound, {
        condition: "Completed",
        limit: 5,
      }),
    ],
  });
  const { selectedMatch, removeSelectedMatch } = useSelectedMatchStore();

  const { activeLeagueAnalyticsData, activeLeagueAnalyticsLoading } =
    useActiveLeagueAnalytics(activeLeagueId);
  const [showUpdates, setShowUpdates] = useState(true);

  const navigate = useNavigate();

  if (activeLeagueAnalyticsLoading || activeLeagueLoading) {
    return (
      <div className="h-screen grid place-content-center">
        <Spinner />
      </div>
    );
  }

  return (
    <ContentShell>
      <ContentHeader title="Dashboard">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowUpdates((prev) => !prev)}
        >
          {showUpdates ? (
            <>
              <EyeOff className="h-4 w-4 mr-1" /> Hide Updates
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-1" /> Show Updates
            </>
          )}
        </Button>
      </ContentHeader>

      <ContentBody>
        {activeLeagueData && activeLeagueAnalyticsData ? (
          <div className="space-y-4">
            {selectedMatch && (
              <SelectedMatchAlert
                match={selectedMatch}
                onRemove={removeSelectedMatch}
                onOtherPage={true}
              />
            )}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <LeagueSection
                league={activeLeagueAnalyticsData.active_league}
                wrap={showUpdates}
              />

              <div className="flex gap-4 items-center flex-wrap">
                <AnalyticsCard
                  title="Total Teams"
                  value={activeLeagueAnalyticsData.total_accepted_teams.count}
                  lastUpdate={
                    activeLeagueAnalyticsData.total_accepted_teams.last_update
                  }
                  icon={UsersRound}
                />
                <AnalyticsCard
                  title="Total Players"
                  value={activeLeagueAnalyticsData.total_players.count}
                  lastUpdate={
                    activeLeagueAnalyticsData.total_players.last_update
                  }
                  icon={UserRound}
                />
                <AnalyticsCard
                  title="Total Categories"
                  value={activeLeagueAnalyticsData.total_categories.count}
                  lastUpdate={
                    activeLeagueAnalyticsData.total_categories.last_update
                  }
                  icon={SendToBack}
                />
              </div>

              <ProfitAreaChart data={activeLeagueAnalyticsData.total_profit} />

              <div className="space-y-2">
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
                  key={"upcoming"}
                  selectedCategory={selectedCategory}
                  selectedRound={selectedRound}
                  leagueMatchData={upcomingMatch.data ?? []}
                  leagueMatchLoading={upcomingMatch.isLoading}
                  refresh={upcomingMatch.refetch}
                  controlls={false}
                  label={"Upcoming Match"}
                  excludeFields={["home_team_score", "away_team_score"]}
                />

                <LeagueMatchTableWrapper
                  key={"completed"}
                  selectedCategory={selectedCategory}
                  selectedRound={selectedRound}
                  leagueMatchData={completedMatch.data ?? []}
                  leagueMatchLoading={completedMatch.isLoading}
                  refresh={completedMatch.refetch}
                  controlls={false}
                  label={"Completed Match"}
                  excludeFields={["scheduled_date"]}
                />
              </div>
            </div>
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Trophy />
              </EmptyMedia>
              <EmptyTitle>No League Yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t started league yet. Start by creating your new
                league.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                onClick={() =>
                  navigate("/league-administrator/pages/league/new")
                }
              >
                Create League
              </Button>
            </EmptyContent>
            <Button
              variant="ghost"
              asChild
              className="text-muted-foreground"
              size="sm"
            >
              <a href="#">
                Learn More <ArrowUpRightIcon />
              </a>
            </Button>
          </Empty>
        )}
      </ContentBody>
    </ContentShell>
  );
}
