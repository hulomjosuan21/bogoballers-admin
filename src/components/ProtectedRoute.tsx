import { Outlet, useNavigate } from "react-router-dom";
import { useAuthLeagueAdmin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

function hasAuthCookies(): boolean {
  const cookies = document.cookie;
  return cookies.includes("access_token") || cookies.includes("QUART_AUTH");
}

export function ProtectedRoute() {
  const navigate = useNavigate();
  const { leagueAdmin, leagueAdminLoading, leagueAdminError } =
    useAuthLeagueAdmin();

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

  if (leagueAdminError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4 text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          {getErrorMessage(leagueAdminError)}
        </p>
        <Button
          onClick={() => navigate("/auth/login")}
          variant="destructive"
          size="sm"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  if (!leagueAdmin) {
    if (!hasAuthCookies()) {
      navigate("/auth/login", { replace: true });
      return null;
    }

    return (
      <div className="flex flex-col items-center justify-center h-screen px-4 text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          You must be logged in to access this page.
        </p>
        <Button
          onClick={() => navigate("/auth/login")}
          variant="destructive"
          size="sm"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  if (!leagueAdmin.user.is_verified) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4 text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Your account is <strong>not yet verified</strong>. Please wait for
          approval from the system administrator.
        </p>
        <Button
          onClick={() => navigate("/auth/login")}
          variant="destructive"
          size="sm"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return <Outlet />;
}
