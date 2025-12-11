import { LifeBuoy, Send } from "lucide-react";

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
import { AppSidebarHeader } from "./nav-header";
import { NavProfile } from "./nav-profile";
import { useAuthLeagueAdmin } from "@/hooks/useAuth";
import { leagueAdminRoutes, type AppRouteObject } from "@/routes";
import { useStaffAuth } from "@/hooks/useStaffAuth";

function buildNavFromRoutes(routes: AppRouteObject[]) {
  const navItems: any[] = [];
  const parentGroups: Record<string, any> = {};

  routes.forEach((route) => {
    if (route.sidebarParent) {
      if (!parentGroups[route.sidebarParent]) {
        const parentRoute = routes.find(
          (r) => r.sidebarParent === route.sidebarParent && r.icon
        );
        parentGroups[route.sidebarParent] = {
          title: route.sidebarParent,
          icon: parentRoute ? parentRoute.icon : undefined,
          url: "#",
          isActive: true,
          items: [],
        };
      }
      parentGroups[route.sidebarParent].items.push({
        title: route.sidebarTitle,
        url: route.path,
      });
    } else {
      navItems.push({
        title: route.sidebarTitle,
        url: route.index ? "/portal/league-administrator" : route.path,
        icon: route.icon,
      });
    }
  });

  return [...navItems, ...Object.values(parentGroups)];
}

const bottomLinks = [
  {
    title: "Support",
    url: "https://github.com/hulomjosuan21",
    icon: LifeBuoy,
    target: "_blank",
  },
  {
    title: "Feedback",
    url: "https://mail.google.com/mail/?view=cm&fs=1&to=hulomjosuan@gmail.com&su=Your%20Subject&body=Your%20message",
    icon: Send,
    target: "_blank",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { leagueAdmin, leagueAdminLoading, leagueAdminError } =
    useAuthLeagueAdmin();
  const { staff, loading: staffLoading } = useStaffAuth();
  const userPermissions =
    leagueAdmin && staff && !leagueAdminLoading && !staffLoading
      ? staff.permissions
      : [];

  const visibleRoutes = leagueAdminRoutes.filter((route) => {
    if (!route.showInSidebar) return false;
    if (route.permissions.length === 0) return true;
    return route.permissions.every((p) => userPermissions.includes(p));
  });

  const platformRoutes = visibleRoutes.filter(
    (r) => r.sidebarGroup === "platform"
  );
  const leagueRoutes = visibleRoutes.filter((r) => r.sidebarGroup === "league");
  const systemRoutes = visibleRoutes.filter((r) => r.sidebarGroup === "system");
  const otherRoutes = visibleRoutes.filter((r) => !r.sidebarGroup);

  const platformNav = buildNavFromRoutes(platformRoutes);
  const leagueNav = buildNavFromRoutes(leagueRoutes);
  const systemNav = buildNavFromRoutes(systemRoutes);
  const otherNav = buildNavFromRoutes(otherRoutes);

  return (
    <Sidebar collapsible="icon" {...props} variant="floating" className="">
      <SidebarHeader className="sidebarColor">
        <AppSidebarHeader />
      </SidebarHeader>

      <ScrollArea className="flex-1 overflow-hidden sidebarColor">
        <SidebarContent className="pb-4">
          {leagueAdminLoading ? (
            <div className="space-y-6">
              <SidebarNavSkeleton label="Platform" count={2} />
              <SidebarNavSkeleton label="League" count={6} />
            </div>
          ) : leagueAdminError ? (
            <div className="flex items-center justify-center h-full py-10 text-sm text-muted-foreground">
              <p>⚠️ Failed to load sidebar</p>
            </div>
          ) : (
            <>
              {platformNav.length > 0 && (
                <NavMenu label="Platform" items={platformNav} />
              )}
              {leagueNav.length > 0 && (
                <NavMenu label="League" items={leagueNav} />
              )}
              {systemNav.length > 0 && (
                <NavMenu label="System" items={systemNav} />
              )}
              {otherNav.length > 0 && <NavMenu label="" items={otherNav} />}
              <NavMenu label="" items={bottomLinks} />
            </>
          )}
        </SidebarContent>
      </ScrollArea>
      <SidebarFooter>
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
