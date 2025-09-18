import Scorebook from "@/components/scorebook/Scorebook";
import { GameProvider } from "@/context/GameContext";
import { useScorebookState } from "@/hooks/scorebook/useScorebookState";
import { CloudOff, Router } from "lucide-react";
import { useParams } from "react-router-dom";

export default function ViewScorebookPage() {
  const { match_id } = useParams<{ match_id: string }>();

  const { state, dispatch, isLoading, isNotFound } = useScorebookState(
    match_id!,
    false
  );

  if (isLoading) {
    return (
      <div className="h-screen grid place-content-center">
        <div className="flex flex-col justify-center items-center">
          <Router className="text-primary" />
          <span> Connecting to Live Scorebook...</span>
        </div>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="h-screen grid place-content-center">
        <div className="flex flex-col justify-center items-center">
          <CloudOff className="text-primary" />
          <span>Live Match Not Found or Has Not Started Yet.</span>
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
      <Scorebook viewMode={true} />
    </GameProvider>
  );
}
