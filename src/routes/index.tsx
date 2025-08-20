import type { RouteObject } from "react-router-dom";
import {
  DashboardPage,
  LeagueResourcePage,
  PlayerSubmissionPage,
  TeamSubmissionPage,
  BracketStructurePage,
  SettingsPage,
  AnalyticsPage,
  LeagueCreationPage,
  LeagueCategoryPage,
  LeagueAffiliatePage,
  LeagueOfficialsPage,
  LeagueMatchSetUnSchedulePage,
  LeagueMatchScheduledPage,
} from "@/pages";

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
    path: "pages/league/bracket/structure",
    element: <BracketStructurePage />,
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
    element: <LeagueCategoryPage />,
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
