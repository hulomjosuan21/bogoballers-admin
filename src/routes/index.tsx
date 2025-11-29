import type { RouteObject } from "react-router-dom";
import {
  DashboardPage,
  TeamSubmissionPage,
  SettingsPage,
  LeagueCreationPage,
  LeagueAffiliatePage,
  LeagueOfficialsPage,
  LeagueMatchSetUnSchedulePage,
  LeagueUpdatePage,
  ManageLeagueCategoriesPage,
} from "@/pages";
import AboutLeaguePage from "@/pages/public/learnings/AboutLeague";
import LeaderboardPage from "@/pages/leaderboard/LeaderboardPage";
import SearchScreen from "@/pages/public/SearchPage";
import LeagueTeamsPage from "@/pages/league-administrator/league/team/LeagueTeamsPage";
import AllPlayersPage from "@/pages/AllPlayersPage";
import AllTeamsPage from "@/pages/AllTeamsPage";
import TestGrid from "@/test/TestGrid";
import { Permission } from "@/enums/permission";
import {
  LayoutDashboard,
  Settings,
  FolderKanban,
  Trophy,
  SquarePen,
  FileQuestionMark,
  type LucideIcon,
  ChevronsRightLeft,
  Network,
  ChartNoAxesGantt,
  ClipboardClock,
  UserStar,
  MessageSquare,
} from "lucide-react";
import ViewScorebookPage from "@/pages/scorebook/ViewLiveScoreBook";
import LoginPage from "@/pages/auth/LoginPage";
import LandingPage from "@/pages/public/landing-page/LandingPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import StartScorebookPage from "@/pages/scorebook/StartNewBook";
import LeagueMatches from "@/pages/league-administrator/league/match/LeagueMatches";
import LiveAdminPage from "@/pages/LiveAdminPage";
import ManualMatchingPage from "@/pages/league-administrator/league/match/manual/ManualManagementPage";
import PublicLeaguePage from "@/components/public-components/PublicLeaguePage";
import LeagueGuestPage from "@/pages/league-administrator/league/guest/LeagueGuestPage";
import AutomaticMatchConfigPage from "@/pages/league-administrator/league/match/automatic/AutomaticMatchConfigXyFlowPage";
import MatchSetupPage from "@/pages/league-administrator/league/match/MatchSetupPage";
import MatchHistoryPage from "@/pages/league-administrator/league/match/MatchHistoryPage";
import ManageLeagueAdministratorPage from "@/pages/ManageLeagueAdminPage";
import ConversationPage from "@/pages/messenger/ConversationPage";
import ChatScreen from "@/pages/messenger/ChatScreen";

export const publicRoutes: RouteObject[] = [
  {
    path: "/view/live-match/:match_id",
    element: <ViewScorebookPage />,
  },
  {
    path: "/auth/register",
    element: <RegisterPage />,
  },
  {
    path: "/league/:publicLeagueId",
    element: <PublicLeaguePage />,
  },
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
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
    path: "/live/matches",
    element: <LiveAdminPage />,
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
    sidebarTitle: "League Dashboard",
    icon: LayoutDashboard,
    sidebarGroup: "platform",
  },

  {
    path: "pages/messages",
    element: <ConversationPage />,
    permissions: [],
    showInSidebar: true,
    sidebarTitle: "Chats",
    icon: MessageSquare,
    sidebarGroup: "platform",
  },

  {
    path: "start-chat/:recipientId/:recipientName?",
    element: <ChatScreen />,
    permissions: [],
    showInSidebar: false,
  },
  {
    path: "pages/league-admins",
    element: <ManageLeagueAdministratorPage />,
    permissions: [Permission.ManagementLeagueAdmins],
    showInSidebar: true,
    sidebarTitle: "LGU Admin Dashboard",
    icon: UserStar,
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
    sidebarTitle: "Active",
    icon: SquarePen,
    sidebarGroup: "league",
  },
  {
    path: "pages/league/manual/configuration",
    element: <ManualMatchingPage />,
    permissions: [Permission.MatchManangement],
    showInSidebar: true,
    sidebarTitle: "Manual",
    sidebarParent: "Match Config",
    icon: Network,
    sidebarGroup: "league",
  },

  {
    path: "pages/league/automatic/configuration",
    element: <AutomaticMatchConfigPage />,
    permissions: [Permission.MatchManangement],
    showInSidebar: true,
    sidebarTitle: "Automatic",
    sidebarParent: "Match Config",
    icon: Network,
    sidebarGroup: "league",
  },
  {
    path: "pages/league/team/official",
    element: <LeagueTeamsPage />,
    permissions: [Permission.ManageTeams],
    showInSidebar: true,
    sidebarTitle: "Official Teams",
    sidebarParent: "Team",
    icon: FolderKanban,
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
    path: "pages/league-categories/manage",
    element: <ManageLeagueCategoriesPage />,
    permissions: [Permission.ManageCategories],
    showInSidebar: true,
    sidebarTitle: "League Categories",
    sidebarParent: "Manage",
    sidebarGroup: "league",
  },
  {
    path: "pages/league-guest/manage",
    element: <LeagueGuestPage />,
    permissions: [Permission.ManageLeagueGuest],
    showInSidebar: true,
    sidebarTitle: "League Guest",
    sidebarParent: "Manage",
    sidebarGroup: "league",
  },
  {
    path: "pages/league/officials&courts",
    element: <LeagueOfficialsPage />,
    permissions: [Permission.ManageOfficialsAndCourts],
    showInSidebar: true,
    sidebarTitle: "Officials & Courts",
    sidebarParent: "Manage",
    icon: ChartNoAxesGantt,
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
    path: "pages/league-matches",
    element: <LeagueMatches />,
    showInSidebar: true,
    icon: ChevronsRightLeft,
    sidebarGroup: "league",
    sidebarParent: "Match",
    sidebarTitle: "Scheduled",
    permissions: [Permission.ScheduleMatches, Permission.ViewScheduledMatches],
  },
  {
    path: "pages/league-matches/history",
    element: <MatchHistoryPage />,
    showInSidebar: true,
    icon: ClipboardClock,
    sidebarGroup: "league",
    sidebarParent: "Match",
    sidebarTitle: "Completed",
    permissions: [Permission.ViewScheduledMatches],
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
    path: "/scorebook/:match_id?",
    element: <StartScorebookPage />,
    permissions: [Permission.ScoreBook],
    showInSidebar: false,
  },
  {
    path: "/test/notsidebar",
    element: <span>test</span>,
    permissions: [Permission.ScoreBook],
    showInSidebar: false,
  },
  {
    path: "/match/setup/:match_id?",
    element: <MatchSetupPage />,
    showInSidebar: false,
    permissions: [Permission.SetupMatch],
  },
];

export const allProtectedRoutes = [
  ...leagueAdminRoutes,
  ...protectedRoutesWithoutSidebar,
];
