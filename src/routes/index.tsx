import type { RouteObject } from "react-router-dom";
import {
  DashboardPage,
  PlayerSubmissionPage,
  TeamSubmissionPage,
  SettingsPage,
  LeagueCreationPage,
  LeagueCategoryManagementPage,
  LeagueAffiliatePage,
  LeagueOfficialsPage,
  LeagueMatchSetUnSchedulePage,
  LeagueMatchScheduledPage,
  LeagueUpdatePage,
  BracketStructurePage,
} from "@/pages";
import AboutLeaguePage from "@/pages/public/learnings/AboutLeague";
import LeaderboardPage from "@/pages/leaderboard/LeaderboardPage";
import SearchScreen from "@/pages/public/SearchPage";
import LeagueTeamsPage from "@/pages/league-administrator/league/team/LeagueTeamsPage";
import AllPlayersPage from "@/pages/AllPlayersPage";
import AllTeamsPage from "@/pages/AllTeamsPage";
import TestGrid from "@/test/TestGrid";
import ScorebookPage from "@/pages/scorebook/Scorebook";
import { Permission } from "@/enums/permission";
import {
  LayoutDashboard,
  UsersRound,
  UserRound,
  GitFork,
  Settings,
  FolderKanban,
  GitBranchPlus,
  Trophy,
  SquarePen,
  FileQuestionMark,
  type LucideIcon,
} from "lucide-react";
import LeagueMatchCompletedPage from "@/pages/league-administrator/league/match/LeagueMatchCompletedPage";

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
];

export type AppRouteObject = RouteObject & {
  permissions: Permission[];
  showInSidebar: boolean;
  sidebarTitle?: string;
  sidebarParent?: string;
  sidebarGroup?: "platform" | "league" | "system";
  icon?: LucideIcon;
};

export const leagueAdminRoutes: AppRouteObject[] = [
  {
    index: true,
    element: <DashboardPage />,
    permissions: [Permission.ViewDashboard],
    showInSidebar: true,
    sidebarTitle: "Dashboard",
    icon: LayoutDashboard,
    sidebarGroup: "platform",
  },
  {
    path: "pages/league-admins",
    element: <span>sdasd</span>,
    permissions: [Permission.ViewLeagueAdmins],
    showInSidebar: true,
    sidebarTitle: "League Admins",
    icon: UsersRound,
    sidebarGroup: "platform",
  },
  {
    path: "pages/league/new",
    element: <LeagueCreationPage />,
    permissions: [Permission.CreateLeague],
    showInSidebar: true,
    sidebarTitle: "Start New",
    icon: Trophy,
    sidebarGroup: "league",
  },
  {
    path: "pages/league/active",
    element: <LeagueUpdatePage />,
    permissions: [Permission.UpdateLeague],
    showInSidebar: true,
    sidebarTitle: "Current",
    icon: SquarePen,
    sidebarGroup: "league",
  },
  {
    path: "pages/league/categories",
    element: <LeagueCategoryManagementPage />,
    permissions: [Permission.ManageCategories],
    showInSidebar: true,
    sidebarTitle: "Manage Categories",
    icon: GitBranchPlus,
    sidebarGroup: "league",
  },
  {
    path: "pages/league/player",
    element: <PlayerSubmissionPage />,
    permissions: [Permission.ManagePlayers],
    showInSidebar: true,
    sidebarTitle: "Players",
    icon: UserRound,
    sidebarGroup: "league",
  },
  {
    path: "pages/league/teams",
    element: <LeagueTeamsPage />,
    permissions: [Permission.ManageTeams],
    showInSidebar: true,
    sidebarTitle: "Official Teams",
    sidebarParent: "Team",
    icon: UsersRound,
    sidebarGroup: "league",
  },
  {
    path: "pages/league/team/submission",
    element: <TeamSubmissionPage />,
    permissions: [Permission.ViewTeamSubmissions],
    showInSidebar: true,
    sidebarTitle: "Submissions",
    sidebarParent: "Team",
    sidebarGroup: "league",
  },
  {
    path: "pages/league/officials&courts",
    element: <LeagueOfficialsPage />,
    permissions: [Permission.ManageOfficialsAndCourts],
    showInSidebar: true,
    sidebarTitle: "Officials & Courts",
    sidebarParent: "Manage",
    icon: FolderKanban,
    sidebarGroup: "league",
  },
  {
    path: "pages/league/affiliates",
    element: <LeagueAffiliatePage />,
    permissions: [Permission.ManageAffiliates],
    showInSidebar: true,
    sidebarTitle: "Sponsors & Partners",
    sidebarParent: "Manage",
    sidebarGroup: "league",
  },
  {
    path: "pages/league/bracket",
    element: <BracketStructurePage />,
    permissions: [Permission.ManageBrackets],
    showInSidebar: true,
    sidebarTitle: "Bracket",
    icon: GitFork,
    sidebarGroup: "league",
  },
  {
    path: "pages/league/match/unscheduled",
    element: <LeagueMatchSetUnSchedulePage />,
    permissions: [Permission.ScheduleMatches],
    showInSidebar: true,
    sidebarTitle: "Set Schedule",
    sidebarParent: "Match",
    icon: FileQuestionMark,
    sidebarGroup: "league",
  },
  {
    path: "pages/league/match/scheduled",
    element: <LeagueMatchScheduledPage />,
    permissions: [Permission.ViewScheduledMatches],
    showInSidebar: true,
    sidebarTitle: "Scheduled Match",
    sidebarParent: "Match",
    sidebarGroup: "league",
  },
  {
    path: "pages/league/match/completed",
    element: <LeagueMatchCompletedPage />,
    permissions: [Permission.ViewScheduledMatches],
    showInSidebar: true,
    sidebarTitle: "Finished Match",
    sidebarParent: "Match",
    sidebarGroup: "league",
  },
  {
    path: "pages/settings",
    element: <SettingsPage />,
    permissions: [Permission.ManageSettings],
    showInSidebar: true,
    sidebarTitle: "Settings",
    sidebarGroup: "system",
    icon: Settings,
  },
];
export const protectedRoutesWithoutSidebar: AppRouteObject[] = [
  {
    path: "/scorebook/:match_id",
    element: <ScorebookPage />,
    permissions: [Permission.ScoreBook],
    showInSidebar: false,
  },
];

export const allProtectedRoutes = [
  ...leagueAdminRoutes,
  ...protectedRoutesWithoutSidebar,
];
