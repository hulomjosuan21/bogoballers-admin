import { ModeToggle } from "@/components/mode-toggle";
import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/date-picker";
import React, { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { LeagueService } from "@/service/league-service";
import { toast } from "sonner";
import { useErrorToast } from "@/components/error-toast";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getActiveLeagueQueryOption } from "@/queries/league";
import ManageCategories from "./league/ManageCategories";

export default function SettingsPage() {
  const { data: activeLeague, refetch } = useQuery(getActiveLeagueQueryOption);
  const hasActiveLeague = useMemo(() => {
    return activeLeague != null && Object.keys(activeLeague).length > 0;
  }, [activeLeague]);
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

  const tab1Content = () => (
    <div className="flex flex-col w-fit">
      <div className="flex items-center gap-3">
        <Label className="whitespace-nowrap">Switch Theme</Label>
        <ModeToggle />
      </div>

      {hasActiveLeague && (
        <section className="p-4 space-y-4">
          <h3 className="text-sm font-bold">Current League Option</h3>

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

            {enabled ? (
              <DatePicker date={date} setDate={setDate} disabled={!enabled} />
            ) : (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <DatePicker date={date} setDate={setDate} disabled />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-1">
                      <p className="text-[13px] font-medium">
                        Player Residency Certificate Valid Until
                      </p>
                      <p className="text-muted-foreground text-xs">
                        You need to enable the{" "}
                        <span className="font-medium">
                          Residency Certificate Required
                        </span>{" "}
                        option before setting a validity date for players.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </section>
      )}
    </div>
  );

  return (
    <ContentShell>
      <ContentHeader title="Settings">
        {hasChanges && (
          <Button onClick={handleSave} variant={"outline"} size={"sm"}>
            Save Changes
          </Button>
        )}
      </ContentHeader>
      <ContentBody>
        <Tabs defaultValue="preferences">
          <ScrollArea>
            <TabsList className="text-foreground mb-3 h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1 w-full justify-start">
              <TabsTrigger value="preferences" className="tab-trigger">
                Preferences
              </TabsTrigger>
              <TabsTrigger value="categories" className="tab-trigger">
                Categories
              </TabsTrigger>
              <TabsTrigger value="organization" className="tab-trigger">
                Organization
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <TabsContent value="preferences">{tab1Content()}</TabsContent>
          <TabsContent value="categories">
            <ManageCategories />
          </TabsContent>
          <TabsContent value="organization">
            <p className="text-muted-foreground pt-1 text-center text-xs">
              Content for Tab 2
            </p>
          </TabsContent>
        </Tabs>
      </ContentBody>
    </ContentShell>
  );
}
