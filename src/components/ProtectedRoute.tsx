import { Outlet, useNavigate } from "react-router-dom";
import { useAuthLeagueAdmin } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error";

function hasAuthCookies(): boolean {
  const cookies = document.cookie;
  return cookies.includes("access_token") || cookies.includes("QUART_AUTH");
}

export function ProtectedRoute() {
  const navigate = useNavigate();
  const { leagueAdmin, leagueAdminLoading, leagueAdminError } =
    useAuthLeagueAdmin();

  if (leagueAdminLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
