import { TeamSection } from "./TeamSection";
import { useGame } from "@/context/GameContext";
import { Button } from "../ui/button";
import { TopSection } from "./TopSection";

type Props = { viewMode?: boolean };

export default function Scorebook({ viewMode = false }: Props) {
  const { state, dispatch, canUndo, canRedo } = useGame();
  return (
    <div className="container mx-auto p-1 space-y-2">
      <div className="flex justify-between items-center">
        <h1 className="text-md font-bold">Digital Basketball Scorebook</h1>
        <div className="flex gap-2">
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => dispatch({ type: "UNDO" })}
            disabled={!canUndo || viewMode}
          >
            Undo
          </Button>
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => dispatch({ type: "REDO" })}
            disabled={!canRedo || viewMode}
          >
            Redo
          </Button>
        </div>
      </div>
      <main className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <TopSection viewMode={viewMode} />
        <TeamSection viewMode={viewMode} team={state.home_team} />
        <TeamSection viewMode={viewMode} team={state.away_team} />
      </main>
    </div>
  );
}
