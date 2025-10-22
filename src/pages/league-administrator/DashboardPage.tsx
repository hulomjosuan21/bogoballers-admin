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
import {
  useActiveLeague,
  useActiveLeagueAnalytics,
} from "@/hooks/useActiveLeague";
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

const RecentUpdates = () => {
  const updates = [
    {
      name: "Bob Johnson",
      time: "2 days ago",
      title: "Weekend Plans",
      body: "Hey everyone! I'm thinking of organizing a team outing this weekend....",
    },
    {
      name: "Emily Davis",
      time: "2 days ago",
      title: "Re: Question about Budget",
      body: "I've reviewed the budget numbers you sent over....",
    },
    {
      name: "Michael Wilson",
      time: "1 week ago",
      title: "Important Announcement",
      body: "Please join us for an all-hands meeting this Friday at 3 PM....",
    },
    {
      name: "Sarah Brown",
      time: "1 week ago",
      title: "Re: Feedback on Proposal",
      body: "Thank you for sending over the proposal. I've reviewed it and have some thoughts....",
    },
  ];

  return (
    <div className="bg-card rounded-md py-4 border shadow-sm">
      <div className="border-b">
        <h2 className="text-md font-semibold mb-4 text-center">
          Recent Updates
        </h2>
      </div>
      <div>
        {updates.map((item, i) => (
          <div key={i} className="border-b p-2 last:border-none last:pb-0">
            <div className="flex justify-between text-sm font-medium">
              <span className="font-light">{item.name}</span>
              <span className="text-muted-foreground text-xs">{item.time}</span>
            </div>
            <p className="font-semibold text-sm">{item.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { activeLeagueId, activeLeagueData, activeLeagueLoading } =
    useActiveLeague();

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
          <div
            className={`grid gap-6 ${
              showUpdates ? "lg:grid-cols-3" : "lg:grid-cols-2"
            }`}
          >
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
            </div>

            {showUpdates && <RecentUpdates />}
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
