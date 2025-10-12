import type { RouteObject } from "react-router-dom";
import {
  DashboardPage,
  TeamSubmissionPage,
  SettingsPage,
  LeagueCreationPage,
  LeagueCategoryManagementPage,
  LeagueAffiliatePage,
  LeagueOfficialsPage,
  LeagueMatchSetUnSchedulePage,
  LeagueMatchScheduledPage,
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
  UsersRound,
  Settings,
  FolderKanban,
  GitBranchPlus,
  Trophy,
  SquarePen,
  FileQuestionMark,
  type LucideIcon,
  MessageSquare,
  ChevronsRightLeft,
  Network,
  ChartNoAxesGantt,
} from "lucide-react";
import LeagueMatchCompletedPage from "@/pages/league-administrator/league/match/LeagueMatchUpcoming";
import ViewScorebookPage from "@/pages/scorebook/ViewLiveScoreBook";
import LoginPage from "@/pages/auth/LoginPage";
import LandingPage from "@/pages/public/landing-page/LandingPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import StartScorebookPage from "@/pages/scorebook/StartNewBook";
import LeagueAdminPagesLGU from "@/pages/LeagueAdminPagesLGU";
import ConversationListPage from "@/pages/ConversationListPage";
import ChatLoader from "@/components/ChatLoader";
import ChatScreen from "@/components/ChatScreen";
import LeagueMatches from "@/pages/league-administrator/league/match/LeagueMatches";
import LiveAdminPage from "@/pages/LiveAdminPage";
import ManualMatchingPage from "@/pages/league-administrator/league/match/manual/ManualManagementPage";
import PublicLeaguePage from "@/components/public-components/PublicLeaguePage";
import LeagueGuestPage from "@/pages/league-administrator/league/guest/LeagueGuestPage";
import AutomaticVersionTwo from "@/pages/league-administrator/league/match/automaticV2/AutomaticMatchConfigPageVersion";

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
    sidebarTitle: "Dashboard",
    icon: LayoutDashboard,
    sidebarGroup: "platform",
  },

  {
    path: "chat",
    element: <ConversationListPage />,
    permissions: [Permission.ViewChat],
    showInSidebar: true,
    sidebarTitle: "Chats",
    icon: MessageSquare,
    sidebarGroup: "platform",
  },
  {
    path: "start-chat/:partnerId/:partnerName",
    element: <ChatLoader />,
    permissions: [Permission.ViewChat],
    showInSidebar: false,
  },
  {
    path: "chat/:partnerId",
    element: <ChatScreen />,
    permissions: [Permission.ViewChat],
    showInSidebar: false,
  },

  {
    path: "pages/league-admins",
    element: <LeagueAdminPagesLGU />,
    permissions: [Permission.ManagementLeagueAdmins],
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
    path: "pages/league/automatic/management",
    element: <LeagueCategoryManagementPage />,
    permissions: [Permission.MatchManangement],
    showInSidebar: true,
    sidebarTitle: "Automatic",
    sidebarParent: "Match Config",
    icon: GitBranchPlus,
    sidebarGroup: "league",
  },
  {
    path: "pages/league/manual/management",
    element: <ManualMatchingPage />,
    permissions: [Permission.MatchManangement],
    showInSidebar: true,
    sidebarTitle: "Manual",
    sidebarParent: "Match Config",
    icon: Network,
    sidebarGroup: "league",
  },
  {
    path: "pages/league/manual/management/v2",
    element: <AutomaticVersionTwo />,
    permissions: [Permission.MatchManangement],
    showInSidebar: true,
    sidebarTitle: "Automatic v2",
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
    path: "pages/league/match/scheduled",
    element: <LeagueMatchScheduledPage />,
    permissions: [Permission.ViewScheduledMatches],
    showInSidebar: true,
    sidebarTitle: "Scheduled",
    sidebarParent: "Match",
    sidebarGroup: "league",
  },
  {
    path: "pages/league/match/upcoming",
    element: <LeagueMatchCompletedPage />,
    permissions: [Permission.ViewScheduledMatches],
    showInSidebar: true,
    sidebarTitle: "Upcoming",
    sidebarParent: "Match",
    sidebarGroup: "league",
  },
  {
    path: "pages/league-matches",
    element: <LeagueMatches />,
    showInSidebar: true,
    icon: ChevronsRightLeft,
    sidebarGroup: "league",
    sidebarParent: "Match",
    sidebarTitle: "Matches",
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
];

export const allProtectedRoutes = [
  ...leagueAdminRoutes,
  ...protectedRoutesWithoutSidebar,
];
