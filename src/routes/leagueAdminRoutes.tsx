import type { RouteObject } from "react-router-dom";
import {
  DashboardPage,
  LeagueCreationPage,
  LeagueResourcePage,
  SetRoundPage,
  PlayerSubmissionPage,
  TeamSubmissionPage,
  BracketStructurePage,
  SettingsPage,
  AnalyticsPage,
} from "@/pages";
import LeagueCategoryPage from "@/pages/league-administrator/league/LeagueCategoryPage";

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
    path: "pages/set/round",
    element: <SetRoundPage />,
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
];
