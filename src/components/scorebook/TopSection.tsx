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
        {viewMode ? (
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
            {state.current_quarter <= 4
              ? `Quarter ${state.current_quarter}`
              : `OT ${state.current_quarter - 4}`}
          </span>
        ) : (
          <Select
            value={String(state.current_quarter)}
            onValueChange={(val) => {
              if (val === "add-ot") {
                dispatch({ type: "ADD_OVERTIME" });
              } else {
                const numericValue = Number(val);
                if (!isNaN(numericValue)) {
                  dispatch({ type: "CHANGE_QUARTER", payload: numericValue });
                }
              }
            }}
            disabled={viewMode}
          >
            <SelectTrigger size="sm">
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
                    disabled={viewMode}
                    className="text-blue-500"
                  >
                    Add Overtime...
                  </SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 font-bold text-sm sm:text-md">
        <span className="sm:hidden">Home</span>
        <span className="hidden sm:inline text-muted-foreground truncate max-w-[80px] sm:max-w-none">
          {state.home_team.team_name}
        </span>

        <span className="p-1 bg-primary text-primary-foreground rounded-sm min-w-[40px] sm:min-w-[60px] text-center">
          {state.home_total_score}
        </span>

        <span className="text-xs sm:text-base">vs</span>

        <span className="p-1 bg-primary text-primary-foreground rounded-sm min-w-[40px] sm:min-w-[60px] text-center">
          {state.away_total_score}
        </span>

        <span className="sm:hidden">Away</span>
        <span className="hidden sm:inline text-muted-foreground truncate max-w-[80px] sm:max-w-none">
          {state.away_team.team_name}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {!viewMode ? (
          <InputGroup>
            <Input
              type="text"
              variant={"sm"}
              value={formatTime(state.time_seconds)}
              onChange={handleTimeChange}
              readOnly={viewMode || state.timer_running}
              className="w-24 text-center font-mono text-md"
            />
            <InputAddon
              onClick={() => dispatch({ type: "TOGGLE_TIMER" })}
              mode={"icon"}
              variant={"sm"}
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
            readOnly
            variant={"sm"}
            className="w-16 sm:w-24 text-center font-mono text-md"
          />
        )}
      </div>
    </div>
  );
}
