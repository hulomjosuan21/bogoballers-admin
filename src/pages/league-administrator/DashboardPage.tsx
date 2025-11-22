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
  PanelRightOpen,
  PanelRightClose,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useActiveLeagueAnalytics } from "@/hooks/useActiveLeague";

import type { League } from "@/types/league";
import { SelectedMatchAlert } from "@/tables/LeagueMatchUpcomingTable";
import { useSelectedMatchStore } from "@/stores/selectedMatchStore";
import {
  MatchHistoryFilter,
  LeagueMatchTableWrapper,
} from "./league/match/MatchHistoryPage";
import { useLeagueCategoriesRoundsGroups } from "@/hooks/useLeagueCategoriesRoundsGroups";
import { useQueries, useQuery } from "@tanstack/react-query";
import { getLeagueMatchQueryOption } from "@/queries/leagueMatchQueryOption";
import { useFetchLeagueGenericData } from "@/hooks/useFetchLeagueGenericData";
import SelectedLeagueStateScreen from "@/components/selectedLeagueStateScreen";
import { useLeagueStore } from "@/stores/leagueStore";
import { leagueService, LeagueStatus } from "@/service/leagueService";
import useDateTime from "@/hooks/useDatetime";
import LeagueAdministratorDisplay from "@/components/LeagueAdministratorDisplay";
import { useAuthLeagueAdmin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ActivityLogsFeed } from "@/components/ActivityLogsFeed";

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
            className="max-h-96 w-full rounded-md border object-cover"
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
  const dateTime = useDateTime();
  const { leagueAdmin, leagueAdminLoading } = useAuthLeagueAdmin(true);

  const activeLeagueParams = useMemo(
    () => ({
      active: true,
      status: [
        LeagueStatus.Pending,
        LeagueStatus.Scheduled,
        LeagueStatus.Ongoing,
      ],
    }),
    []
  );

  const {
    leagueId: activeLeagueId,
    data,
    isFetching,
    refetch,
    isError,
    error,
  } = useFetchLeagueGenericData<League>({
    key: ["is-active"],
    options: {
      enabled: !!leagueAdmin && !leagueAdminLoading,
    },
    params: activeLeagueParams,
  });

  const { setLeague, setQueryState } = useLeagueStore();

  useEffect(() => {
    setQueryState({
      isLoading: false,
      isError,
      error: error ?? null,
      leagueId: activeLeagueId,
      refetch,
    });
  }, [isFetching, isError, error, activeLeagueId, refetch, setQueryState]);

  useEffect(() => {
    if (data) setLeague(data);
  }, [data, setLeague]);

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
      getLeagueMatchQueryOption(
        selectedCategory,
        selectedRound,
        {
          condition: "Upcoming",
          limit: 5,
        },
        !!!leagueAdmin && leagueAdminLoading
      ),
      getLeagueMatchQueryOption(
        selectedCategory,
        selectedRound,
        {
          condition: "Completed",
          limit: 5,
        },
        !!!leagueAdmin && leagueAdminLoading
      ),
    ],
  });

  const { selectedMatch, removeSelectedMatch } = useSelectedMatchStore();

  const { activeLeagueAnalyticsData, activeLeagueAnalyticsLoading } =
    useActiveLeagueAnalytics(activeLeagueId);

  const [showActivityFeed, setShowActivityFeed] = useState(true);

  const queryKey = ["activity-logs", activeLeagueId];
  const {
    data: logData,
    isLoading: logLoading,
    error: logError,
  } = useQuery({
    queryKey,
    queryFn: () =>
      leagueService.getLogs({
        league_id: activeLeagueId,
      }),
    enabled: !!activeLeagueId,
  });

  if (isFetching || activeLeagueAnalyticsLoading || leagueAdminLoading) {
    return <SelectedLeagueStateScreen loading={true} />;
  }

  if (data == null || !activeLeagueAnalyticsData || !leagueAdmin) {
    return <SelectedLeagueStateScreen />;
  }

  const leagueStatus = data.status as LeagueStatus;

  const handledStates: Record<LeagueStatus, boolean> = {
    Pending: false,
    Completed: true,
    Postponed: true,
    Rejected: true,
    Cancelled: true,
    Scheduled: false,
    Ongoing: false,
  };

  if (handledStates[leagueStatus]) {
    return <SelectedLeagueStateScreen state={leagueStatus} league={data} />;
  }

  return (
    <ContentShell>
      <ContentHeader title="Dashboard">
        <div className="">
          <span className="text-xs font-medium">{dateTime}</span>
        </div>
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

            <div className="border-b pb-1">
              <span className="font-semibold font-md">Active League</span>
            </div>

            <div className="flex flex-col gap-6">
              <LeagueSection
                league={activeLeagueAnalyticsData.active_league}
                wrap={true}
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
            </div>

            {leagueAdmin && (
              <LeagueAdministratorDisplay dashboard={true} data={leagueAdmin} />
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

          {showActivityFeed && (
            <div className="hidden lg:block relative">
              <div className="absolute inset-0">
                <div className="h-full rounded-md bg-card border">
                  <ActivityLogsFeed
                    logs={logData?.data || []}
                    isLoading={logLoading}
                    error={logError}
                    height="h-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </ContentBody>
    </ContentShell>
  );
}
