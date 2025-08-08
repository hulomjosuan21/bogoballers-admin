import * as React from "react";
import {
  LayoutDashboard,
  ChartSpline,
  UsersRound,
  UserRound,
  Book,
  Plus,
  GitFork,
  LifeBuoy,
  Send,
  Settings,
  CalendarCheck,
  FileBox,
  CalendarArrowUp,
  FlagTriangleRight,
  FolderKanban,
  Icon,
  GitBranchPlus,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { NavMenu } from "./nav-menu";
// import { NavUser } from "./nav-profile"
import { NavSecondaryMenu } from "./nav-secondary-menu";
import { AppSidebarHeader } from "./nav-header";
import { NavProfile } from "./nav-profile";
import { useAuthLeagueAdmin } from "@/hooks/useAuth";

const data = {
  platform: [
    {
      title: "Dashboard",
      url: "/league-administrator",
      icon: LayoutDashboard,
    },
    {
      title: "Analytics",
      url: "/league-administrator/pages/analytics",
      icon: ChartSpline,
    },
    {
      title: "Player",
      url: "#",
      icon: UserRound,
      isActive: true,
      items: [
        {
          title: "All",
          url: "#",
        },
        {
          title: "Submission",
          url: "/league-administrator/pages/league/player/submission",
        },
      ],
    },
    {
      title: "Team",
      url: "#",
      icon: UsersRound,
      isActive: true,
      items: [
        {
          title: "All",
          url: "#",
        },
        {
          title: "Submissions",
          url: "/league-administrator/pages/league/team/submission",
        },
      ],
    },
  ],
  league: [
    {
      title: "Create",
      url: "/league-administrator/pages/league/new",
      icon: Plus,
    },
    {
      title: "Current",
      url: "/league-administrator/pages/league/current",
      icon: Book,
    },
    {
      title: "Categories",
      url: "/league-administrator/pages/league/categories",
      icon: GitBranchPlus,
    },
    {
      title: "Manage",
      url: "#",
      icon: FolderKanban,
      isActive: true,
      items: [
        {
          title: "Officials & Courts",
          url: "/league-administrator/pages/league/officials",
        },
        {
          title: "Sponsors & Partners",
          url: "/league-administrator/pages/league/affiliates",
        },
      ],
    },
    {
      title: "Bracket",
      url: "#",
      icon: GitFork,
      isActive: true,
      items: [
        {
          title: "Structure",
          url: "/league-administrator/pages/league/bracket/structure",
        },
        {
          title: "Match Team",
          url: "/league-administrator/pages/league/bracket/structure",
        },
      ],
    },
  ],
  match: [
    {
      title: "Set Round",
      url: "/league-administrator/pages/set/round",
      icon: FlagTriangleRight,
    },
    {
      title: "Set Schedule",
      url: "/league-administrator/pages/match/unscheduled",
      icon: CalendarArrowUp,
    },
    {
      title: "Scheduled Match",
      url: "/league-administrator/pages/match/scheduled",
      icon: CalendarCheck,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/league-administrator/pages/settings",
      icon: Settings,
    },
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { leagueAdmin, leagueAdminLoading } = useAuthLeagueAdmin();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppSidebarHeader />
      </SidebarHeader>

      <ScrollArea className="flex-1 overflow-hidden">
        <SidebarContent className="pb-4">
          {leagueAdminLoading ? (
            <div className="space-y-6">
              <SidebarNavSkeleton label="Platform" count={4} />
              <SidebarNavSkeleton label="League" count={3} />
              <SidebarNavSkeleton label="Game" count={1} />
            </div>
          ) : leagueAdminLoading ? (
            <div className="flex items-center justify-center h-full py-10 text-sm text-muted-foreground">
              <p>⚠️ Failed to load sidebar: {"error"}</p>
            </div>
          ) : (
            <>
              <NavMenu label="Platform" items={data.platform} />
              <NavMenu label="League" items={data.league} />
              <NavMenu label="Match" items={data.match} />
            </>
          )}
        </SidebarContent>
      </ScrollArea>
      <SidebarFooter>
        <div className="border-t border-muted" />

        {!leagueAdminLoading && (
          <NavSecondaryMenu items={data.navSecondary} className="mt-auto" />
        )}

        {leagueAdminLoading || !leagueAdmin ? (
          <NavUserSkeleton />
        ) : (
          <NavProfile leagueAdmin={leagueAdmin} />
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function NavUserSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="flex flex-col space-y-1">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}

function SidebarNavSkeleton({
  label,
  count,
}: {
  label: string;
  count: number;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground px-4 pt-4">{label}</p>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 px-4 py-2">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}
