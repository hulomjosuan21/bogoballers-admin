import { useEffect, useRef, useState } from "react";
import { Settings2 } from "lucide-react";

import { useActiveLeague } from "@/hooks/useActiveLeague";
import { toast } from "sonner";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NoteBox } from "@/components/nodebox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RoundStateEnum,
  type RoundNodeData,
} from "@/types/leagueCategoryTypes";
import { LeagueCategoryRoundService } from "@/service/leagueCategory";
import { useAlertDialog } from "@/hooks/userAlertDialog";
import { getErrorMessage } from "@/lib/error";
import { refetchActiveLeagueCategories } from "@/hooks/useLeagueCategories";
import { LeagueRoundService } from "@/service/leagueRoundService";
import { LeagueMatchService } from "@/service/leagueMatchService";

export type LeagueCategoryRoundUpdatableFields = {
  round_status: string;
  format_config: Record<string, any> | null;
  auto_proceed: boolean;
};

export function RoundNodeSheet({
  data,
  disable,
}: {
  data: RoundNodeData;
  disable: boolean;
}) {
  const { round } = data;

  const { activeLeagueId } = useActiveLeague();

  const [isPending, setPending] = useState(false);

  const [status, setStatus] = useState(round.round_status);
  const originalStatus = useRef(round.round_status);

  const { openDialog } = useAlertDialog();

  useEffect(() => {
    setStatus(round.round_status);
    originalStatus.current = round.round_status;
  }, [round]);

  const hasChanges = status !== originalStatus.current;

  const handleSave = () => {
    if (!hasChanges) {
      toast.info("No changes detected");
      return;
    }

    setPending(true);

    const updateRound = async () => {
      try {
        if (status !== originalStatus.current) {
          const confirm = await openDialog({
            confirmText: "Yes",
            cancelText: "No",
          });

          if (!confirm) return;

          const response = await LeagueCategoryRoundService.progressRound({
            roundId: round.round_id,
            changes: { round_status: status, auto_proceed: false },
          });

          await refetchActiveLeagueCategories(activeLeagueId);
          originalStatus.current = status;
          return response;
        }

        return "No updates required";
      } finally {
        setPending(false);
      }
    };

    toast.promise(updateRound(), {
      loading: "Updating round...",
      success: (message) => message,
      error: (err) => getErrorMessage(err),
    });
  };

  const handleGenerateEliminatioMatches = () => {
    if (!data.round || !activeLeagueId) return;

    setPending(true);

    const generate = async () => {
      try {
        return await LeagueRoundService.genereteEliminationMatches(
          activeLeagueId,
          data.round.round_id
        );
      } finally {
        setPending(false);
      }
    };

    toast.promise(generate(), {
      loading: "Updating round...",
      success: (res) => res.message,
      error: (err) => getErrorMessage(err),
    });
  };

  const handleProceedNextRound = () => {
    const proceed = async () => {
      const confirm = await openDialog({
        title: "Confirm Round Progression",
        description:
          "Updating this round will automatically adjust the status of the previous or next round accordingly.",
        confirmText: "Yes",
        cancelText: "No",
      });

      let auto_proceed = false;
      if (confirm) {
        auto_proceed = true;
      }

      try {
        return await LeagueMatchService.progressNext(
          activeLeagueId!,
          data.round.round_id,
          auto_proceed
        );
      } finally {
        await refetchActiveLeagueCategories(activeLeagueId);
      }
    };

    toast.promise(proceed(), {
      loading: "Updating round...",
      success: (res) => res.message,
      error: (err) => getErrorMessage(err),
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="settings"
          disabled={disable}
        >
          <Settings2 className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>Round: {round.round_name}</SheetTitle>
        </SheetHeader>
        <SheetBody className="flex-1">
          <div className="grid gap-4">
            <NoteBox>Status changes are tracked automatically.</NoteBox>
            <NoteBox>
              Changing to Ongoing will automatically generate matches base on
              format.
            </NoteBox>
            <NoteBox>
              Changing to Finished will automatically compute the results
            </NoteBox>

            <div className="grid gap-1">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as RoundStateEnum)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RoundStateEnum.Upcoming}>
                    Upcoming
                  </SelectItem>
                  <SelectItem value={RoundStateEnum.Ongoing}>
                    Ongoing
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-helper">
                Set the current status of this round.
              </p>
              <Button
                className="mt-8"
                variant={"dashed"}
                onClick={handleGenerateEliminatioMatches}
                disabled={data.round.round_status == RoundStateEnum.Finished}
              >
                {!data.round.matches_generated
                  ? "Generate Match"
                  : "Regenerate Match"}
              </Button>
              <Button
                disabled={data.round.round_status !== RoundStateEnum.Ongoing}
                onClick={handleProceedNextRound}
              >
                Proceed to next round
              </Button>
            </div>
          </div>
        </SheetBody>
        <SheetFooter className="flex justify-end gap-2">
          <SheetClose asChild>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || isPending}
              size="sm"
              className="w-full"
            >
              Save Changes
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
