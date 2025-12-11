import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  matchPath,
  Navigate,
} from "react-router-dom";
import { useAuthLeagueAdmin } from "@/hooks/useAuth";
import { useStaffAuth } from "@/hooks/useStaffAuth";
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
import { toast } from "sonner";
import { CreateSuperStaffGate } from "./pages/league-administrator/staff/_components/staffComponents";
import StaffLoginPage from "./pages/league-administrator/staff/_components/staffLogin";
import { leagueAdminStaffService } from "./service/leagueAdminStaffService";

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
  const [hasSuperStaff, setHasSuperStaff] = useState<boolean | null>(null);

  // 1. Define paths
  const protectedPaths = [
    "portal/league-administrator",
    "portal/league-administrator/*",
    "/create-super-staff",
    ...protectedRoutesWithoutSidebar.map((route) => route.path),
  ];

  // 2. Check if current path is protected
  const isProtectedPath = protectedPaths.some((path) =>
    matchPath(path!, location.pathname)
  );

  // 3. Robust check for creation page (Handles trailing slashes)
  const isCreationPage = !!matchPath("/create-super-staff", location.pathname);

  const { leagueAdminId, leagueAdmin, leagueAdminLoading, leagueAdminError } =
    useAuthLeagueAdmin(isProtectedPath);

  const { staff, loading: staffLoading } = useStaffAuth();

  const isLoading =
    leagueAdminLoading ||
    (isProtectedPath && staffLoading) ||
    (isProtectedPath && hasSuperStaff === null);

  useEffect(() => {
    if (isProtectedPath && leagueAdmin && leagueAdminId) {
      const checkSuperStaff = async () => {
        try {
          const response = await leagueAdminStaffService.checkSuperStaffStatus(
            leagueAdminId
          );
          setHasSuperStaff(response.exists);
        } catch (error) {
          setHasSuperStaff(false);
        }
      };
      checkSuperStaff();
    } else if (!isProtectedPath) {
      setHasSuperStaff(null);
    }
  }, [isProtectedPath, leagueAdmin, leagueAdminId]);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // --- RENDER LOGIC ---

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

    if (!leagueAdmin.is_operational) {
      toast.error("This account is not yet given the privilege to operate.");
      return <LoginPage />;
    }

    if (hasSuperStaff === null) {
      return (
        <div className="flex flex-col items-center justify-center h-screen px-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Verifying Staff Configuration...
          </p>
          <Progress value={progress} className="w-64" />
        </div>
      );
    }

    if (hasSuperStaff === false) {
      if (!isCreationPage) {
        return <Navigate to="/create-super-staff" replace />;
      }
    } else if (hasSuperStaff === true) {
      if (isCreationPage) {
        return <Navigate to="/staff-login" replace />;
      }
      if (!staff) {
        return <Navigate to="/staff-login" replace />;
      }
    }

    const userPermissions = staff?.permissions || [];

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
        <Route
          path="portal/league-administrator"
          element={<LeagueAdminLayout />}
        >
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
        <Route path="/create-super-staff" element={<CreateSuperStaffGate />} />
        <Route path="/staff-login" element={<StaffLoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/staff-login" element={<StaffLoginPage />} />
      <Route path="/create-super-staff" element={<CreateSuperStaffGate />} />

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
