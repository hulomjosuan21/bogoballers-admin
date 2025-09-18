import Scorebook from "@/components/scorebook/Scorebook";
import { GameProvider } from "@/context/GameContext";
import { useScorebookState } from "@/hooks/scorebook/useScorebookState";
import { useParams } from "react-router-dom";

export default function ViewScorebookPage() {
  const { match_id } = useParams();

  const { state, dispatch, isLoading } = useScorebookState(match_id!, false);

  if (isLoading) {
    return <div>Connecting to Live Scorebook...</div>;
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
