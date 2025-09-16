import { TeamSection } from "./TeamSection";
import { useGame } from "@/context/GameContext";
import { Button } from "../ui/button";
import { TopSection } from "./TopSection";
import { FileSliders, Redo, Table2, Undo } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FullRosterSummaryTable } from "./FullRosterSummaryTable";

type Props = { viewMode?: boolean };

export default function Scorebook({ viewMode = false }: Props) {
  const { state, dispatch, canUndo, canRedo } = useGame();

  return (
    <div className="mx-auto px-1 pb-2 pt-4 space-y-2">
      <Tabs defaultValue="scorebook" className="text-sm text-muted-foreground">
        <div className="flex items-center justify-between mb-2 relative">
          <h1 className="ml-4 text-sm font-semibold">
            BogoBallers Digital Basketball Scorebook
          </h1>

          <div className="absolute left-1/2 transform -translate-x-1/2">
            <TabsList className="grid grid-cols-2 gap-1" size="xs">
              <TabsTrigger value="scorebook">
                <FileSliders /> Scorebook
              </TabsTrigger>
              <TabsTrigger value="summary">
                <Table2 /> Summary
              </TabsTrigger>
            </TabsList>
          </div>

          {!viewMode && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch({ type: "UNDO" })}
                disabled={!canUndo || viewMode}
              >
                <Undo className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch({ type: "REDO" })}
                disabled={!canRedo || viewMode}
              >
                <Redo className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="scorebook">
          <main className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <TopSection viewMode={viewMode} />
            <TeamSection viewMode={viewMode} team={state.home_team} />
            <TeamSection viewMode={viewMode} team={state.away_team} />
          </main>
        </TabsContent>

        <TabsContent value="summary">
          <main className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <FullRosterSummaryTable team={state.home_team} />
            <FullRosterSummaryTable team={state.away_team} />
          </main>
        </TabsContent>
      </Tabs>
    </div>
  );
}
