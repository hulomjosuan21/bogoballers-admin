import { getUserPermissions } from "@/enums/permission";
import { useAuthLeagueAdmin } from "@/hooks/useAuth";
import { leagueAdminRoutes, protectedRoutesWithoutSidebar } from ".";
import { Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/public/landing-page/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LeagueAdminLayout from "@/layouts/LeagueAdminLayout";
import RegisterPage from "@/pages/auth/RegisterPage";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export function AppRoutes() {
  const { leagueAdmin, leagueAdminLoading } = useAuthLeagueAdmin();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (leagueAdminLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 300);
      return () => clearInterval(interval);
    }
  }, [leagueAdminLoading]);

  if (leagueAdminLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4 space-y-4">
        <p className="text-sm text-muted-foreground">Loading your account...</p>
        <Progress value={progress} className="w-64" />
      </div>
    );
  }

  const userPermissions = leagueAdmin
    ? getUserPermissions(leagueAdmin.account.account_type)
    : [];

  const filteredLeagueAdminRoutes = leagueAdminRoutes.filter((route) => {
    if (route.permissions.length === 0) return true;
    return route.permissions.some((p) => userPermissions.includes(p));
  });

  const filteredProtectedRoutesWithoutSidebar =
    protectedRoutesWithoutSidebar.filter((route) => {
      if (route.permissions.length === 0) return true;
      return route.permissions.some((p) => userPermissions.includes(p));
    });

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/league-administrator" element={<LeagueAdminLayout />}>
          {filteredLeagueAdminRoutes.map((route, index) => (
            <Route
              key={index}
              index={route.index}
              path={route.path}
              element={route.element}
            />
          ))}
        </Route>

        {filteredProtectedRoutesWithoutSidebar.map((route, index) => (
          <Route
            key={`no-sidebar-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}
      </Route>
    </Routes>
  );
}
