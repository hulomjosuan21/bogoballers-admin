import { TeamSection } from "./TeamSection";
import { useGame } from "@/context/GameContext";
import { Button } from "../ui/button";
import { TopSection } from "./TopSection";
import { FileSliders, Redo, Table2, Undo } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FullRosterSummaryTable } from "./FullRosterSummaryTable";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "react-router-dom";

type Props = { viewMode?: boolean; latency: number | null };

export default function Scorebook({ viewMode = false, latency }: Props) {
  const { state, dispatch, canUndo, canRedo } = useGame();
  const navigate = useNavigate();

  useHotkeys("ctrl+shift+b, cmd+shift+b", () => {
    navigate(-1);
  });

  useHotkeys(
    "t",
    () => {
      dispatch({ type: "TOGGLE_TIMER" });
      (document.activeElement as HTMLElement)?.blur();
    },
    {
      enabled: !viewMode,
    }
  );

  useHotkeys(
    "ctrl+z, cmd+z",
    () => {
      dispatch({ type: "UNDO" });
      (document.activeElement as HTMLElement)?.blur();
    },
    {
      enabled: canUndo && !viewMode,
    }
  );

  useHotkeys(
    "ctrl+y, ctrl+shift+z, cmd+shift+z",
    () => {
      if (!canRedo) return;
      dispatch({ type: "REDO" });
      (document.activeElement as HTMLElement)?.blur();
    },
    {
      enabled: canRedo && !viewMode,
    }
  );

  return (
    <div className="mx-auto px-1 pb-2 pt-4 space-y-2">
      <Tabs defaultValue="scorebook" className="text-sm text-muted-foreground">
        <div className="flex items-center justify-between gap-2 mb-2 relative">
          <div className="flex items-center gap-1">
            <h1 className="ml-4 text-sm font-semibold">
              BogoBallers Digital Basketball Scorebook
            </h1>
            <Badge variant="outline" className="gap-1.5 text-xs font-light">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  latency == null
                    ? "bg-gray-400"
                    : latency < 100
                    ? "bg-emerald-500"
                    : latency < 200
                    ? "bg-orange-500"
                    : "bg-red-500"
                )}
                aria-hidden="true"
              />
              {latency != null ? `${latency}ms` : "Disconnected"}
            </Badge>
          </div>

          {viewMode ? (
            <div className="ml-auto mr-4">
              <TabsList className="grid grid-cols-2 gap-1" size="xs">
                <TabsTrigger value="scorebook">
                  <FileSliders /> Scorebook
                </TabsTrigger>
                <TabsTrigger value="summary">
                  <Table2 /> Summary
                </TabsTrigger>
              </TabsList>
            </div>
          ) : (
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
          )}

          {!viewMode && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch({ type: "UNDO" })}
                disabled={!canUndo}
              >
                <Undo className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch({ type: "REDO" })}
                disabled={!canRedo}
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
