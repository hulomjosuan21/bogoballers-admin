import Scorebook from "@/components/scorebook/Scorebook";
import { GameProvider } from "@/context/GameContext";
import { useScorebookState } from "@/hooks/scorebook/useScorebookState";
import { useAuthLeagueAdmin } from "@/hooks/useAuth";
import { Router } from "lucide-react";
import { useParams } from "react-router-dom";

export default function StartScorebookPage() {
  const { match_id } = useParams();
  const { leagueAdmin, leagueAdminLoading } = useAuthLeagueAdmin(true);

  const { state, dispatch, isLoading, latency } = useScorebookState(
    match_id!,
    true,
    leagueAdmin?.league_administrator_id
  );

  if (isLoading || leagueAdminLoading) {
    return (
      <div className="h-screen grid place-content-center">
        <div className="flex flex-col justify-center items-center">
          <Router className="text-primary" />
          <span>Loading Scorebook...</span>
        </div>
      </div>
    );
  }

  const contextValue = {
    state: state.present,
    dispatch,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };

  return (
    <GameProvider value={contextValue}>
      <Scorebook viewMode={false} latency={latency} />
    </GameProvider>
  );
}
