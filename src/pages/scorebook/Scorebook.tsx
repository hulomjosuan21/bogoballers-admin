import Scorebook from "@/components/scorebook/Scorebook";
import { GameProvider } from "@/context/GameContext";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function ScorebookPage() {
  const { match_id } = useParams();
  useEffect(() => {
    console.log("MatchId: ", match_id);
  }, []);
  return (
    <GameProvider>
      <Scorebook viewMode={false} />
    </GameProvider>
  );
}
