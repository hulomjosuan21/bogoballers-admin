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
  PanelRightOpen,
  PanelRightClose,
  type LucideIcon,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SelectedMatchAlert } from "@/tables/LeagueMatchUpcomingTable";
import { useSelectedMatchStore } from "@/stores/selectedMatchStore";
import {
  MatchHistoryFilter,
  LeagueMatchTableWrapper,
} from "./league/match/LeagueMatchCompletedPage";
import { useLeagueCategoriesRoundsGroups } from "@/hooks/useLeagueCategoriesRoundsGroups";
import { useQueries, useQuery } from "@tanstack/react-query";
import { getLeagueMatchQueryOption } from "@/queries/leagueMatchQueryOption";
import { LeagueService, leagueService } from "@/service/leagueService";
import useDateTime from "@/hooks/useDatetime";
import { Button } from "@/components/ui/button";
import { ActivityLogsFeed } from "@/components/ActivityLogsFeed";
import { Skeleton } from "@/components/ui/skeleton";
import ScheduleGraph from "@/components/ScheduleGraph";
import { queryClient } from "@/lib/queryClient";
import useActiveLeagueMeta from "@/hooks/useActiveLeagueMeta";
import {
  NoActiveLeagueAlert,
  PendingLeagueAlert,
} from "@/components/LeagueStatusAlert";

export interface DashboardLeague {
  league_id: string;
  status: string;
  banner_url: string;
  league_title: string;
  league_description: string;
}

interface DashboardCardProps {
  title: string;
  value: number | string;
  lastUpdate?: string | null;
  icon?: LucideIcon;
}

const LeagueSection = ({ league }: { league: DashboardLeague }) => {
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
      <div className="grid gap-4 items-start">
        <ImageZoom>
          <img
            src={league.banner_url}
            alt="activeleague-banner"
            className="max-h-96 w-full rounded-md border object-cover"
          />
        </ImageZoom>

        <div className="flex flex-col gap-3 items-center text-center lg:items-start lg:text-left">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 my-2">
            <h1 className="text-lg font-semibold">{league.league_title}</h1>
            {leagueStatus(league.status)}
          </div>
          <p className="text-muted-foreground text-sm text-justify">
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

const DashboardFallback = ({
  error,
  reset,
}: {
  error?: Error | null;
  reset: () => void;
}) => {
  return (
    <ContentShell>
      <ContentHeader title="Active League Dashboard" />
      <ContentBody>
        <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold tracking-tight">
              Dashboard Unavailable
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {error?.message ||
                "We couldn't load the active league data. This might be a connection issue or the league data is missing."}
            </p>
          </div>
          <Button onClick={reset} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </ContentBody>
    </ContentShell>
  );
};

export default function DashboardPage() {
  const { isActive, league_id, message, league_status } = useActiveLeagueMeta();

  const activeLeagueId = league_id!;
  const dateTime = useDateTime();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["league-dashboard"],
    queryFn: () => LeagueService.fetchDashboard(),
    enabled: isActive,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isActive) return;
    queryClient.prefetchQuery({
      queryKey: ["active-league-data"],
      queryFn: () => LeagueService.fetchActive(),
      staleTime: Infinity,
    });
  }, [queryClient, isActive]);

  const {
    categories,
    rounds,
    selectedCategory,
    selectedRound,
    setSelectedCategory,
    setSelectedRound,
  } = useLeagueCategoriesRoundsGroups({ enable: isActive });
  const [upcomingMatch, completedMatch] = useQueries({
    queries: [
      getLeagueMatchQueryOption(
        selectedCategory,
        selectedRound,
        { condition: "Upcoming", limit: 5 },
        !isActive
      ),
      getLeagueMatchQueryOption(
        selectedCategory,
        selectedRound,
        { condition: "Completed", limit: 5 },
        !isActive
      ),
    ],
  });
  const {
    data: analytics,
    isLoading: analyticsLoading,
    isError: analyticsError,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ["active-league-analytics", activeLeagueId],
    queryFn: () => LeagueService.analytics(activeLeagueId),
    enabled: isActive,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const {
    data: logs,
    isLoading: logsLoading,
    error: logsError,
  } = useQuery({
    queryKey: ["league-logs", activeLeagueId],
    queryFn: () => leagueService.getLogs({ league_id: activeLeagueId }),
    enabled: isActive,
  });

  const { selectedMatch, removeSelectedMatch } = useSelectedMatchStore();
  const [showActivityFeed, setShowActivityFeed] = useState(true);

  if (!isActive) {
    return (
      <NoActiveLeagueAlert message={message ?? "No active league found."} />
    );
  }

  if (!isLoading && (isError || !data)) {
    return <DashboardFallback error={error} reset={() => refetch()} />;
  }

  return (
    <ContentShell>
      <ContentHeader title="Active League Dashboard">
        <span className="text-xs font-medium">{dateTime}</span>

        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => setShowActivityFeed(!showActivityFeed)}
        >
          {showActivityFeed ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
        </Button>
      </ContentHeader>

      <ContentBody>
        {isActive && league_status === "Pending" && (
          <PendingLeagueAlert onContentBody={false} />
        )}

        <div
          className={`grid gap-4 ${
            showActivityFeed ? "lg:grid-cols-[1fr_20rem]" : "grid-cols-1"
          }`}
        >
          <div className="min-w-0 space-y-4">
            {selectedMatch && (
              <SelectedMatchAlert
                match={selectedMatch}
                onRemove={removeSelectedMatch}
                onOtherPage={true}
              />
            )}

            {isLoading && !data ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-2/3" />
              </div>
            ) : (
              <LeagueSection league={data!} />
            )}

            {/* Analytics */}
            <div className="flex gap-4 items-center flex-wrap">
              {analyticsLoading || !analytics ? (
                <>
                  <Skeleton className="h-24 w-40 rounded-xl" />
                  <Skeleton className="h-24 w-40 rounded-xl" />
                  <Skeleton className="h-24 w-40 rounded-xl" />
                </>
              ) : analyticsError ? (
                <p className="text-sm text-red-500">
                  Failed to load analytics.{" "}
                  <button onClick={() => refetchAnalytics()}>Retry</button>
                </p>
              ) : (
                <>
                  <AnalyticsCard
                    title="Total Teams"
                    value={analytics.total_accepted_teams?.count ?? 0}
                    lastUpdate={
                      analytics.total_accepted_teams?.last_update ?? null
                    }
                  />
                  <AnalyticsCard
                    title="Total Players"
                    value={analytics.total_players?.count ?? 0}
                    lastUpdate={analytics.total_players?.last_update ?? null}
                  />
                  <AnalyticsCard
                    title="Total Categories"
                    value={analytics.total_categories?.count ?? 0}
                    lastUpdate={analytics.total_categories?.last_update ?? null}
                  />
                </>
              )}
            </div>

            {analytics && (
              <>
                {analyticsLoading ? (
                  <Skeleton className="h-[300px] w-full rounded-xl" />
                ) : (
                  <ProfitAreaChart data={analytics.total_profit ?? []} />
                )}

                {analyticsLoading ? (
                  <Skeleton className="h-24 w-full rounded-md" />
                ) : (
                  <ScheduleGraph
                    data={analytics.matches_chart_data?.chart ?? []}
                    endDate={
                      analytics.matches_chart_data?.last_match_date
                        ? new Date(analytics.matches_chart_data.last_match_date)
                        : new Date()
                    }
                    days={analytics.matches_chart_data?.total_days ?? 365}
                  />
                )}
              </>
            )}

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

              {upcomingMatch.isLoading ? (
                <Skeleton className="h-64 w-full rounded-md" />
              ) : (
                <LeagueMatchTableWrapper
                  label="Upcoming Match"
                  selectedCategory={selectedCategory}
                  selectedRound={selectedRound}
                  leagueMatchData={upcomingMatch.data ?? []}
                  leagueMatchLoading={upcomingMatch.isLoading}
                  refresh={upcomingMatch.refetch}
                  controlls={false}
                  excludeFields={["home_team_score", "away_team_score"]}
                />
              )}

              {completedMatch.isLoading ? (
                <Skeleton className="h-64 w-full rounded-md" />
              ) : (
                <LeagueMatchTableWrapper
                  label="Completed Match"
                  selectedCategory={selectedCategory}
                  selectedRound={selectedRound}
                  leagueMatchData={completedMatch.data ?? []}
                  leagueMatchLoading={completedMatch.isLoading}
                  refresh={completedMatch.refetch}
                  controlls={false}
                  excludeFields={["scheduled_date"]}
                />
              )}
            </div>
          </div>

          {showActivityFeed && (
            <div className="hidden lg:block relative">
              <div className="absolute inset-0">
                <div className="h-full rounded-md bg-card border">
                  {logsLoading ? (
                    <div className="space-y-3 p-4">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-5/6" />
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ) : (
                    <ActivityLogsFeed
                      logs={logs?.data || []}
                      isLoading={logsLoading}
                      error={logsError}
                      height="h-full"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </ContentBody>
    </ContentShell>
  );
}
