import type { RouteObject } from "react-router-dom";
import {
  DashboardPage,
  LeagueResourcePage,
  PlayerSubmissionPage,
  TeamSubmissionPage,
  SettingsPage,
  AnalyticsPage,
  LeagueCreationPage,
  LeagueCategoryManagementPage,
  LeagueAffiliatePage,
  LeagueOfficialsPage,
  LeagueMatchSetUnSchedulePage,
  LeagueMatchScheduledPage,
} from "@/pages";
import AboutLeaguePage from "@/pages/public/learnings/AboutLeague";
import LeaderboardPage from "@/pages/leaderboard/LeaderboardPage";
import SearchScreen from "@/pages/public/SearchScreen";

export const publicRoutes: RouteObject[] = [
  {
    path: "/about/league",
    element: <AboutLeaguePage />,
  },
  {
    path: "/leaderboard",
    element: <LeaderboardPage />,
  },
  {
    path: "/find",
    element: <SearchScreen />,
  },
];

export const leagueAdminRoutes: RouteObject[] = [
  {
    index: true,
    element: <DashboardPage />,
  },
  {
    path: "pages/league/new",
    element: <LeagueCreationPage />,
  },
  {
    path: "pages/league/resource",
    element: <LeagueResourcePage />,
  },
  {
    path: "pages/league/match/scheduled",
    element: <LeagueMatchScheduledPage />,
  },
  {
    path: "pages/league/match/unscheduled",
    element: <LeagueMatchSetUnSchedulePage />,
  },
  {
    path: "pages/league/player/submission",
    element: <PlayerSubmissionPage />,
  },
  {
    path: "pages/league/team/submission",
    element: <TeamSubmissionPage />,
  },
  {
    path: "pages/settings",
    element: <SettingsPage />,
  },
  {
    path: "pages/analytics",
    element: <AnalyticsPage />,
  },
  {
    path: "pages/league/categories",
    element: <LeagueCategoryManagementPage />,
  },
  {
    path: "pages/league/officials&courts",
    element: <LeagueOfficialsPage />,
  },
  {
    path: "pages/league/affiliates",
    element: <LeagueAffiliatePage />,
  },
];
