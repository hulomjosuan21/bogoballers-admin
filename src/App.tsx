import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  matchPath,
} from "react-router-dom";
import { useAuthLeagueAdmin } from "@/hooks/useAuth";
import { getUserPermissions } from "@/enums/permission";
import {
  leagueAdminRoutes,
  protectedRoutesWithoutSidebar,
  publicRoutes,
} from "./routes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import LoginPage from "@/pages/auth/LoginPage";
import LeagueAdminLayout from "@/layouts/LeagueAdminLayout";

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4 space-y-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-lg text-muted-foreground">Page Not Found</p>
      <Button size={"sm"} onClick={() => navigate(-1)} variant="outline">
        Go Back
      </Button>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);

  const protectedPaths = [
    "/league-administrator",
    "/league-administrator/*",
    ...protectedRoutesWithoutSidebar.map((route) => route.path),
  ];

  const isProtectedPath = protectedPaths.some((path) =>
    matchPath(path!, location.pathname)
  );

  const { leagueAdmin, leagueAdminLoading, leagueAdminError } =
    useAuthLeagueAdmin(isProtectedPath);

  useEffect(() => {
    if (leagueAdminLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 300);
      return () => clearInterval(interval);
    }
  }, [leagueAdminLoading]);

  if (isProtectedPath) {
    if (leagueAdminLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-screen px-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Loading Application...
          </p>
          <Progress value={progress} className="w-64" />
        </div>
      );
    }

    if (leagueAdminError || !leagueAdmin) {
      return (
        <Routes>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      );
    }

    const userPermissions = getUserPermissions(
      leagueAdmin.account.account_type
    );

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

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {publicRoutes.map((route, index) => (
        <Route
          key={`public-${index}`}
          path={route.path}
          element={route.element}
        />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
