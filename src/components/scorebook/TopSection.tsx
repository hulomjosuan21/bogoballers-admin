import { useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { Input, InputAddon, InputGroup } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { CirclePause, Play } from "lucide-react";

type Props = { viewMode?: boolean };

export function TopSection({ viewMode = false }: Props) {
  const { state, dispatch } = useGame();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (state.timer_running && state.time_seconds > 0) {
      interval = setInterval(() => {
        dispatch({ type: "TIMER_TICK" });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.timer_running, state.time_seconds, dispatch]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [minutes, seconds] = e.target.value.split(":").map(Number);
    const totalSeconds = (minutes || 0) * 60 + (seconds || 0);
    if (!isNaN(totalSeconds)) {
      dispatch({ type: "SET_TIME", payload: totalSeconds });
    }
  };

  return (
    <div className="col-span-1 md:col-span-2 flex items-center justify-between py-1 px-2 border rounded-md bg-card text-card-foreground">
      <div className="flex items-center gap-4">
        <Select
          value={String(state.current_quarter)}
          onValueChange={(val) => {
            const numericValue = Number(val);
            if (!isNaN(numericValue)) {
              dispatch({ type: "CHANGE_QUARTER", payload: numericValue });
            }
          }}
          disabled={viewMode}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: state.quarters }, (_, i) => {
              const quarterNum = i + 1;
              const isRegulation = quarterNum <= 4;
              const otNumber = quarterNum - 4;

              return (
                <SelectItem key={quarterNum} value={String(quarterNum)}>
                  {isRegulation ? `Quarter ${quarterNum}` : `OT ${otNumber}`}
                </SelectItem>
              );
            })}

            {state.current_quarter >= 4 && (
              <>
                <SelectSeparator />
                <SelectItem
                  value="add-ot"
                  onSelect={(e) => {
                    e.preventDefault();
                    dispatch({ type: "ADD_OVERTIME" });
                  }}
                  disabled={viewMode}
                  className="text-blue-500"
                >
                  Add Overtime...
                </SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4 font-bold text-lg">
        <span className="text-muted-foreground">
          {state.home_team.team_name}
        </span>
        <span className="p-1 bg-primary text-primary-foreground rounded-md min-w-[60px] text-center">
          {state.home_total_score}
        </span>
        <span>vs</span>
        <span className="p-1 bg-primary text-primary-foreground rounded-md min-w-[60px] text-center">
          {state.away_total_score}
        </span>
        <span className="text-muted-foreground">
          {state.away_team.team_name}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {!viewMode ? (
          <InputGroup>
            <Input
              type="text"
              value={formatTime(state.time_seconds)}
              onChange={handleTimeChange}
              disabled={viewMode}
              className="w-24 text-center font-mono text-2xl"
            />
            <InputAddon
              onClick={() => dispatch({ type: "TOGGLE_TIMER" })}
              mode={"icon"}
            >
              {state.timer_running ? (
                <CirclePause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </InputAddon>
          </InputGroup>
        ) : (
          <Input
            type="text"
            value={formatTime(state.time_seconds)}
            onChange={handleTimeChange}
            readOnly={viewMode}
            className="w-24 text-center font-mono text-2xl"
          />
        )}
      </div>
    </div>
  );
}
