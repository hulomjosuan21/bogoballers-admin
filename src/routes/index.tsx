import type { RouteObject } from "react-router-dom";
import {
  DashboardPage,
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
  LeagueUpdatePage,
} from "@/pages";
import AboutLeaguePage from "@/pages/public/learnings/AboutLeague";
import LeaderboardPage from "@/pages/leaderboard/LeaderboardPage";
import SearchScreen from "@/pages/public/SearchPage";
import LeagueTeamsPage from "@/pages/league-administrator/league/team/LeagueTeamsPage";
import AllPlayersPage from "@/pages/AllPlayersPage";
import AllTeamsPage from "@/pages/AllTeamsPage";
import TestGrid from "@/test/TestGrid";
import ScorebookPage from "@/pages/scorebook/Scorebook";

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
  {
    path: "/player/all",
    element: <AllPlayersPage />,
  },
  {
    path: "/team/all",
    element: <AllTeamsPage />,
  },
  {
    path: "/test/grid",
    element: <TestGrid />,
  },
  {
    path: "/test/scorebook",
    element: <ScorebookPage />,
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
  { path: "pages/league/active", element: <LeagueUpdatePage /> },
  {
    path: "pages/league/teams",
    element: <LeagueTeamsPage />,
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
    path: "pages/league/player",
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
