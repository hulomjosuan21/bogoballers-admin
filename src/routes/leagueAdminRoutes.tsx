import type { RouteObject } from "react-router-dom";
import {
  DashboardPage,
  LeagueResourcePage,
  SetRoundPage,
  PlayerSubmissionPage,
  TeamSubmissionPage,
  BracketStructurePage,
  SettingsPage,
  AnalyticsPage,
  LeagueCreationPage,
  LeagueCategoryPage,
  LeagueAffiliatePage,
  LeagueOfficialsPage,
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
  {
    path: "pages/league/officials",
    element: <LeagueOfficialsPage />,
  },
  {
    path: "pages/league/affiliates",
    element: <LeagueAffiliatePage />,
  },
];
