import Scorebook from "@/components/scorebook/Scorebook";
import { GameProvider } from "@/context/GameContext";
import { useScorebookState } from "@/hooks/scorebook/useScorebookState";
import { useParams } from "react-router-dom";

export default function StartScorebookPage() {
  const { match_id } = useParams();

  const { state, dispatch, isLoading } = useScorebookState(match_id!, true);

  if (isLoading) {
    return <div>Loading Scorebook...</div>;
  }

  const contextValue = {
    state: state.present,
    dispatch,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };

  return (
    <GameProvider value={contextValue}>
      <Scorebook viewMode={false} />
    </GameProvider>
  );
}
