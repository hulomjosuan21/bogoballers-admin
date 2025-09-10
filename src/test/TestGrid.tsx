import {
  ModuleRegistry,
  AllCommunityModule,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import { useState, useMemo, useRef, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { Button } from "@/components/ui/button";
import { Loader2Icon, Minus, Plus } from "lucide-react";

ModuleRegistry.registerModules([AllCommunityModule]);

interface Player {
  name: string;
  score: number;
}

export default function TestGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Update state when user exits fullscreen with ESC
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    setIsLoading;
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      // Enter fullscreen
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen(); // Safari
      } else if ((containerRef.current as any).msRequestFullscreen) {
        (containerRef.current as any).msRequestFullscreen(); // IE11
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  const [team1, setTeam1] = useState<Player[]>([
    { name: "Alice - 2", score: 10 },
    { name: "Bob", score: 15 },
    { name: "Charlie", score: 8 },
    { name: "David", score: 12 },
    { name: "Eva", score: 20 },
  ]);

  const [team2, setTeam2] = useState<Player[]>([
    { name: "Frank", score: 9 },
    { name: "Grace", score: 11 },
    { name: "Henry", score: 14 },
    { name: "Ivy", score: 7 },
    { name: "Jack", score: 18 },
  ]);

  const updateScore = (
    team: "team1" | "team2",
    rowIndex: number,
    delta: number
  ) => {
    const updater = team === "team1" ? setTeam1 : setTeam2;
    const data = team === "team1" ? [...team1] : [...team2];
    data[rowIndex].score += delta;
    if (data[rowIndex].score < 0) data[rowIndex].score = 0;
    updater(data);
  };

  const colDefs = useMemo<ColDef<Player>[]>(
    () => [
      { field: "name", flex: 2 },
      {
        field: "score",
        flex: 1,
        cellRenderer: (params: ICellRendererParams<Player>) => {
          const rowIndex = params.node.rowIndex;
          if (rowIndex === null) return params.value;
          const isTeam1 = params.api.getGridId()?.includes("team1");

          return (
            <div className="flex items-center justify-center gap-1">
              <Button
                size="icon"
                variant="dashed"
                className="h-6 w-6 p-0 rounded-sm"
                onClick={() =>
                  updateScore(isTeam1 ? "team1" : "team2", rowIndex, -1)
                }
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-6 text-center font-medium">
                {params.value}
              </span>
              <Button
                size="icon"
                variant="dashed"
                className="h-6 w-6 p-0 rounded-sm"
                onClick={() =>
                  updateScore(isTeam1 ? "team1" : "team2", rowIndex, 1)
                }
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          );
        },
      },
    ],
    [team1, team2]
  );

  return (
    <div className="ag-theme-alpine-dark grid grid-rows-[48px,1fr] w-screen h-screen">
      <header className="flex items-center justify-between px-2">
        <Button onClick={toggleFullscreen} size={"sm"}>
          {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        </Button>
        <Button
          variant={"dashed"}
          onClick={() => setIsLoading((prev) => !prev)}
        >
          {isLoading && <Loader2Icon className="animate-spin" />}
          Please wait
        </Button>
      </header>
      <div className="grid grid-rows-2 grid-cols-2 gap-1 px-1">
        <div className="flex flex-col w-full h-fit">
          <AgGridReact
            key="team1-grid"
            rowData={team1}
            columnDefs={colDefs}
            domLayout="autoHeight"
          />
        </div>
        <div className="flex flex-col w-full h-fit">
          <AgGridReact
            key="team2-grid"
            rowData={team2}
            columnDefs={colDefs}
            domLayout="autoHeight"
          />
        </div>
        <div className="flex items-center justify-center w-full h-full bg-violet-400">
          <span>Top Left Placeholder</span>
        </div>
        <div className="flex items-center justify-center w-full h-full bg-violet-400">
          <span>Bottom Right Placeholder</span>
        </div>
      </div>
    </div>
  );
}
