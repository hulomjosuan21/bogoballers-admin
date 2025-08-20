import { ModeToggle } from "@/components/mode-toggle";
import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/date-picker";
import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActiveLeagueQueryOptions } from "@/queries/league";
import { LeagueService } from "@/service/league-service";
import { toast } from "sonner";
import { useErrorToast } from "@/components/error-toast";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { data: activeLeague, refetch } = useQuery(getActiveLeagueQueryOptions);
  const handleError = useErrorToast();

  const [date, setDate] = React.useState<Date>();
  const [enabled, setEnabled] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  const originalOptionRef = React.useRef<{
    player_residency_certificate_required: boolean;
    player_residency_certificate_valid_until: string;
  } | null>(null);

  useEffect(() => {
    if (activeLeague) {
      setEnabled(activeLeague.option.player_residency_certificate_required);
      setDate(
        new Date(activeLeague.option.player_residency_certificate_valid_until)
      );
      originalOptionRef.current = {
        player_residency_certificate_required:
          activeLeague.option.player_residency_certificate_required,
        player_residency_certificate_valid_until:
          activeLeague.option.player_residency_certificate_valid_until,
      };
      setHasChanges(false);
    }
  }, [activeLeague]);

  useEffect(() => {
    if (!originalOptionRef.current) return;

    const isChanged =
      enabled !==
        originalOptionRef.current.player_residency_certificate_required ||
      date?.toISOString() !==
        new Date(
          originalOptionRef.current.player_residency_certificate_valid_until
        ).toISOString();

    setHasChanges(isChanged);
  }, [enabled, date]);

  const handleSave = async () => {
    if (!activeLeague || !originalOptionRef.current) {
      handleError("League data is not loaded.");
      return;
    }

    const changes: Partial<typeof originalOptionRef.current> = {};

    if (
      enabled !==
      originalOptionRef.current.player_residency_certificate_required
    ) {
      changes.player_residency_certificate_required = enabled;
    }

    if (
      date?.toISOString() !==
      new Date(
        originalOptionRef.current.player_residency_certificate_valid_until
      ).toISOString()
    ) {
      changes.player_residency_certificate_valid_until =
        date?.toISOString() ?? "";
    }

    if (Object.keys(changes).length === 0) {
      toast.info("No changes detected.");
      return;
    }

    try {
      await LeagueService.updateOption({
        leagueId: activeLeague.league_id,
        data: changes,
      });

      await refetch();

      toast.success("League options updated successfully.");
    } catch (e) {
      handleError(e);
    }
  };

  return (
    <ContentShell>
      <ContentHeader title="Settings">
        {hasChanges && (
          <Button variant={"outline"} onClick={handleSave} size={"sm"}>
            Save Changes
          </Button>
        )}
      </ContentHeader>
      <ContentBody>
        <div className="flex flex-col gap-2 w-fit">
          <div className="flex items-center gap-3">
            <Label className="whitespace-nowrap">Switch Theme</Label>
            <ModeToggle />
          </div>

          {activeLeague && (
            <section className="p-4 space-y-4">
              <h3 className="text-base font-semibold">Current League Option</h3>

              <div className="flex items-center gap-3">
                <Label className="whitespace-nowrap">
                  Player Residency Certificate Required
                </Label>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>

              <div className="flex items-center gap-3">
                <Label className="whitespace-nowrap">
                  Player Residency Certificate Valid Until
                </Label>
                <DatePicker date={date} setDate={setDate} disabled={!enabled} />
              </div>
            </section>
          )}
        </div>
      </ContentBody>
    </ContentShell>
  );
}
