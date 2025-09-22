import { useState } from "react";
import { useToggleMatchBookSection } from "@/stores/matchStore";
import type { MatchBook } from "@/types/scorebook";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FullRosterSummaryTable } from "./scorebook/FullRosterSummaryTable";
import { ChevronLeft } from "lucide-react";
import { LeagueMatchService } from "@/service/leagueMatchService";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";

export default function FinalizaMatchSection({ match }: { match: MatchBook }) {
  const { reset } = useToggleMatchBookSection();
  const [editableMatch, setEditableMatch] = useState<MatchBook>(match);
  const [loading, setLoading] = useState(false);

  const handleScoreChange = (
    side: "home_total_score" | "away_total_score",
    value: string
  ) => {
    setEditableMatch((prev) => ({
      ...prev,
      [side]: Number(value) || 0,
    }));
  };

  const handleSave = async () => {
    setLoading(true);

    const promise = LeagueMatchService.finalizeOne(match.match_id, match);

    toast.promise(promise, {
      loading: "Saving match...",
      success: (res) => res.message,
      error: (err) => getErrorMessage(err) ?? "Something went wrong!",
    });

    try {
      await promise;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="outline" size="sm" onClick={reset}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="p-3 border rounded-md space-y-2 text-sm">
        <div className="border-b pb-2">
          <h2 className="font-semibold">Match Details</h2>
        </div>
        <div className="flex justify-between">
          <span>Quarters</span>
          <span>{editableMatch.quarters}</span>
        </div>

        <div className="flex justify-between">
          <span>Minutes per Quarter</span>
          <span>{editableMatch.minutes_per_quarter}</span>
        </div>

        <div className="flex justify-between">
          <span>Minutes per Overtime</span>
          <span>{editableMatch.minutes_per_overtime}</span>
        </div>

        <div className="flex justify-between">
          <span>Current Quarter</span>
          <span>{editableMatch.current_quarter}</span>
        </div>

        <div className="flex justify-between">
          <span>Overtime</span>
          <span>{editableMatch.is_overtime ? "Yes" : "No"}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 border rounded-md space-y-2">
          <div className="border-b">
            <h3 className="font-semibold mb-2">
              {editableMatch.home_team.team_name}
            </h3>
          </div>

          <div className="flex justify-between items-center">
            <span>Total Score</span>
            <Input
              type="number"
              value={editableMatch.home_total_score}
              onChange={(e) =>
                handleScoreChange("home_total_score", e.target.value)
              }
              variant={"sm"}
              className="w-24 score-input remove-spinner"
            />
          </div>

          <div className="flex justify-between">
            <span>Coach</span>
            <span>
              {editableMatch.home_team.coach} ({editableMatch.home_team.coachT}{" "}
              T)
            </span>
          </div>

          <div className="flex justify-between">
            <span>Non-member T</span>
            <span>{editableMatch.home_team.none_memberT}</span>
          </div>

          <div className="mt-2 font-semibold">Score per Qtr:</div>
          {editableMatch.home_team.score_per_qtr.map((s) => (
            <div key={s.qtr} className="flex justify-between pl-2">
              <span>Q{s.qtr}</span>
              <span>{s.score}</span>
            </div>
          ))}

          <div className="mt-2 font-semibold">Fouls per Qtr</div>
          {editableMatch.home_team.teamF_per_qtr.map((f) => (
            <div key={f.qtr} className="flex justify-between pl-2">
              <span>Q{f.qtr}</span>
              <span>{f.foul}</span>
            </div>
          ))}
        </div>

        <div className="p-3 border rounded-md space-y-2">
          <div className="border-b">
            <h3 className="font-semibold mb-2">
              {editableMatch.away_team.team_name}
            </h3>
          </div>

          <div className="flex justify-between items-center">
            <span>Total Score</span>
            <Input
              type="number"
              value={editableMatch.away_total_score}
              variant={"sm"}
              onChange={(e) =>
                handleScoreChange("away_total_score", e.target.value)
              }
              className="w-24 score-input remove-spinner"
            />
          </div>

          <div className="flex justify-between">
            <span>Coach</span>
            <span>
              {editableMatch.away_team.coach} ({editableMatch.away_team.coachT}{" "}
              T)
            </span>
          </div>

          <div className="flex justify-between">
            <span>Non-member T</span>
            <span>{editableMatch.away_team.none_memberT}</span>
          </div>

          <div className="mt-2 font-semibold">Score per Qtr:</div>
          {editableMatch.away_team.score_per_qtr.map((s) => (
            <div key={s.qtr} className="flex justify-between pl-2">
              <span>Q{s.qtr}</span>
              <span>{s.score}</span>
            </div>
          ))}

          <div className="mt-2 font-semibold">Fouls per Qtr</div>
          {editableMatch.away_team.teamF_per_qtr.map((f) => (
            <div key={f.qtr} className="flex justify-between pl-2">
              <span>Q{f.qtr}</span>
              <span>{f.foul}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <FullRosterSummaryTable team={editableMatch.home_team} />
        <FullRosterSummaryTable team={editableMatch.away_team} />
      </div>

      <Button className="w-full" onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : "Finalize"}
      </Button>
    </div>
  );
}
