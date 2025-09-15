import Scorebook from "@/components/scorebook/Scorebook";
import { GameProvider } from "@/context/GameContext";

export default function ScorebookPage() {
  return (
    <GameProvider>
      <Scorebook viewMode={false} />
    </GameProvider>
  );
}
