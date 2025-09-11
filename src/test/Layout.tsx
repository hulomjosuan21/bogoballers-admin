import {
  ModuleRegistry,
  AllCommunityModule,
  type ColDef,
  type ICellRendererParams,
  themeQuartz,
} from "ag-grid-community";
import { useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, UndoDot } from "lucide-react";
import { Input, InputAddon, InputGroup } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

ModuleRegistry.registerModules([AllCommunityModule]);

interface Player {
  name: string;
  score: number;
  pn: number;
  tn: number;
}

interface Progress {
  qtr: string;
  team_fouls: number;
  score: number;
}

interface Summary {
  fgAndFga2?: string;
  fgAndFga3?: string;
  ftAndFta?: string;
  reb: number;
  ast: number;
  f: number;
  tp: number;
}

export default function AutoFitGrid() {
  const [team1, setTeam1] = useState<Player[]>([
    { name: "Alice - 2", score: 10, pn: 0, tn: 0 },
    { name: "Bob", score: 15, pn: 0, tn: 0 },
    { name: "Charlie", score: 8, pn: 0, tn: 0 },
    { name: "David", score: 12, pn: 0, tn: 0 },
    { name: "Eva", score: 20, pn: 0, tn: 0 },
  ]);

  const [team2, setTeam2] = useState<Player[]>([
    { name: "Frank", score: 9, pn: 0, tn: 0 },
    { name: "Grace", score: 11, pn: 0, tn: 0 },
    { name: "Henry", score: 14, pn: 0, tn: 0 },
    { name: "Ivy", score: 7, pn: 0, tn: 0 },
    { name: "Jack", score: 18, pn: 0, tn: 0 },
  ]);

  const [p1, _] = useState<Progress[]>([
    { qtr: "1st", team_fouls: 0, score: 10 },
  ]);

  const [s1, s3] = useState<Summary[]>([{ reb: 0, ast: 0, f: 0, tp: 0 }]);

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
              {/* Undo button */}
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6 p-0 rounded-sm"
                onClick={() =>
                  updateScore(isTeam1 ? "team1" : "team2", rowIndex, -1)
                }
              >
                <UndoDot className="h-3 w-3" />
              </Button>

              {/* Score display */}
              <span className="w-6 text-center font-medium">
                {params.value}
              </span>

              {/* +1 button */}
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 rounded-sm"
                onClick={() =>
                  updateScore(isTeam1 ? "team1" : "team2", rowIndex, 1)
                }
              >
                +1
              </Button>

              {/* +2 button */}
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 rounded-sm"
                onClick={() =>
                  updateScore(isTeam1 ? "team1" : "team2", rowIndex, 2)
                }
              >
                +2
              </Button>

              {/* +3 button */}
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 rounded-sm"
                onClick={() =>
                  updateScore(isTeam1 ? "team1" : "team2", rowIndex, 3)
                }
              >
                +3
              </Button>
            </div>
          );
        },
      },
      {
        field: "pn",
        flex: 0.5,
      },
      {
        field: "tn",
        flex: 0.5,
      },
    ],
    [team1, team2]
  );

  const colDefs2 = useMemo<ColDef<Progress>[]>(
    () => [
      { field: "qtr", flex: 2 },
      { field: "team_fouls", flex: 1 },
      { field: "score", flex: 1 },
    ],
    [p1]
  );

  const colDefs3 = useMemo<ColDef<Summary>[]>(
    () => [
      { field: "fgAndFga2", flex: 2 },
      { field: "fgAndFga3", flex: 2 },
      { field: "ftAndFta", flex: 2 },
      { field: "reb", flex: 1 },
      { field: "ast", flex: 1 },
      { field: "f", flex: 1 },
      { field: "tp", flex: 1 },
    ],
    [s1]
  );

  return (
    <div className="grid grid-rows-[auto,auto,auto,auto,auto] grid-cols-2 gap-1 p-1">
      <div className="flex col-span-2">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select qtr" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>qtr</SelectLabel>
              <SelectItem value="apple">1st</SelectItem>
              <SelectItem value="banana">2nd</SelectItem>
              <SelectItem value="blueberry">3rd</SelectItem>
              <SelectItem value="1">O.T 1</SelectItem>
              <SelectItem value="2">O.T 2</SelectItem>
              <SelectItem value="3">O.T 3</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="">
        <AgGridReact
          theme={themeQuartz}
          key="team1-grid"
          rowData={team1}
          columnDefs={colDefs}
          domLayout="autoHeight"
        />
      </div>

      <div className="">
        <AgGridReact
          theme={themeQuartz}
          key="team12-grid"
          rowData={team1}
          columnDefs={colDefs}
          domLayout="autoHeight"
        />
      </div>

      <div className="grid grid-cols-1 gap-1">
        <div className="flex-2">
          <AgGridReact
            key="team2-grid"
            rowData={p1}
            columnDefs={colDefs2}
            domLayout="autoHeight"
          />
        </div>

        <div className="flex gap-2">
          <InputGroup>
            <InputAddon variant={"sm"}>Coach Tn</InputAddon>
            <Input type="number" variant={"sm"} />
          </InputGroup>
          <InputGroup>
            <InputAddon variant={"sm"}>None Member Tn</InputAddon>
            <Input type="number" variant={"sm"} />
          </InputGroup>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1">
        <div className="flex-2">
          <AgGridReact
            key="team2-grid"
            rowData={p1}
            columnDefs={colDefs2}
            domLayout="autoHeight"
          />
        </div>
        <div className="flex gap-2">
          <InputGroup>
            <InputAddon variant={"sm"}>Coach Tn</InputAddon>
            <Input type="number" variant={"sm"} />
          </InputGroup>
          <InputGroup>
            <InputAddon variant={"sm"}>None Member Tn</InputAddon>
            <Input type="number" variant={"sm"} />
          </InputGroup>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1">
        <div className="flex-2">
          <AgGridReact
            key="team2-grid"
            rowData={s1}
            columnDefs={colDefs3}
            domLayout="autoHeight"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1">
        <div className="flex-2">
          <AgGridReact
            key="team2-grid"
            rowData={s1}
            columnDefs={colDefs3}
            domLayout="autoHeight"
          />
        </div>
      </div>
    </div>
  );
}
