import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trophy, AlertTriangle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { LeagueMatchService } from "@/service/leagueMatchService";
import { getErrorMessage } from "@/lib/error";
import type { LeagueMatch } from "@/types/leagueMatch";

interface ManualScoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: Partial<LeagueMatch> | null;
  onSuccess: () => Promise<void> | void;
}

export function ManualScoreDialog({
  open,
  onOpenChange,
  match,
  onSuccess,
}: ManualScoreDialogProps) {
  const [homeScore, setHomeScore] = useState<string>("");
  const [awayScore, setAwayScore] = useState<string>("");
  useEffect(() => {
    if (open && match) {
      setHomeScore(String(match.home_team_score ?? 0));
      setAwayScore(String(match.away_team_score ?? 0));
    }
  }, [open, match]);

  const updateScoreMutation = useMutation({
    mutationFn: ({
      matchId,
      homeScore,
      awayScore,
    }: {
      matchId: string;
      homeScore: number;
      awayScore: number;
    }) =>
      LeagueMatchService.updateScore(matchId, {
        home_score: homeScore,
        away_score: awayScore,
      }),
    onSuccess: async (response) => {
      toast.success(response.message || "Scores updated");
      onOpenChange(false);
      await onSuccess();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error) || "Failed to update scores"),
  });

  const handleUpdateScores = () => {
    if (!match?.league_match_id) return;

    const parsedHome = parseInt(homeScore);
    const parsedAway = parseInt(awayScore);

    if (isNaN(parsedHome) || isNaN(parsedAway)) {
      toast.error("Please enter valid numeric scores");
      return;
    }

    updateScoreMutation.mutate({
      matchId: match.league_match_id,
      homeScore: parsedHome,
      awayScore: parsedAway,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Record Match Result
          </DialogTitle>
        </DialogHeader>

        <Alert variant={"warning"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Manual Entry</AlertTitle>
          <AlertDescription className="text-xs">
            Use this only if the Match Scorebook was not used. This sets the
            team totals but <strong>does not</strong> track individual player
            stats.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-6 py-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase font-semibold">
              Home Team
            </Label>
            <div className="flex items-center gap-2 mb-2">
              {match?.home_team ? (
                <>
                  <img
                    src={match.home_team.team_logo_url}
                    alt="Home"
                    className="h-6 w-6 rounded object-cover"
                  />
                  <span className="text-sm font-medium truncate">
                    {match.home_team.team_name}
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">TBD</span>
              )}
            </div>
            <Input
              type="number"
              min="0"
              className="text-center text-lg font-bold"
              placeholder="0"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
            />
          </div>

          {/* Away Team Input */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase font-semibold">
              Away Team
            </Label>
            <div className="flex items-center gap-2 mb-2">
              {match?.away_team ? (
                <>
                  <img
                    src={match.away_team.team_logo_url}
                    alt="Away"
                    className="h-6 w-6 rounded object-cover"
                  />
                  <span className="text-sm font-medium truncate">
                    {match.away_team.team_name}
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">TBD</span>
              )}
            </div>
            <Input
              type="number"
              min="0"
              className="text-center text-lg font-bold"
              placeholder="0"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateScoreMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateScores}
            disabled={updateScoreMutation.isPending}
          >
            {updateScoreMutation.isPending ? "Saving..." : "Save Scores"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
