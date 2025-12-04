import { ModeToggle } from "@/components/mode-toggle";
import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManageCategories from "./league/ManageCategories";
import UpdateOrganizationTab from "@/components/UpdateOrganization";
import { Suspense, useState, useTransition } from "react";
import LeagueHistoryTable from "@/tables/LeagueHistoryTable";
import { Spinner } from "@/components/ui/spinner";
import { ShortcutItem } from "@/components/shortCutItem";
import { useToggleLeagueHistorySection } from "@/stores/leagueHistoryStore";
import { ToggleState } from "@/stores/toggleStore";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Printer } from "lucide-react";
import { formatDate12h } from "@/lib/app_utils";
import { toast } from "sonner";
import {
  printMatchScorebook,
  printMultipleMatches,
} from "@/components/pdf/MatchScorebookPdf";
import type { MatchBook } from "@/types/scorebook";
import { useSearchParams } from "react-router-dom";
const ON_NEW_WINDOW = import.meta.env.VITE_NEW_WINDOW === "true";

export function LeaguesTabContent() {
  const { state, data: leagueHistory, reset } = useToggleLeagueHistorySection();
  const records = leagueHistory?.league_match_records ?? [];

  const allMatchBooks: MatchBook[] = records.map((rec) => rec.record_json);

  return (
    <Suspense
      key="league-history"
      fallback={
        <div className="h-40 grid place-content-center">
          <Spinner />
        </div>
      }
    >
      {state === ToggleState.SHOW_LEAGUE ? (
        <section>
          <div className="w-full max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">League Matches Records</h2>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={reset}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size={"sm"}
                  variant={"secondary"}
                  onClick={() => printMultipleMatches(allMatchBooks)}
                >
                  Print All
                </Button>
              </div>
            </div>

            <ScrollArea className="rounded-md border p-4">
              <div className="space-y-4">
                {records.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    No records yet.
                  </p>
                )}

                {records.map((rec) => {
                  return (
                    <div id={`record-${rec.record_id}`} key={rec.record_id}>
                      <div className="flex flex-row items-center justify-between">
                        <span className="text-sm font-medium">
                          {rec.record_name}
                        </span>
                        <span className="text-sm font-medium">
                          {rec.home_team} vs {rec.away_team}
                        </span>
                        <span className="text-sm font-medium">
                          {formatDate12h(rec.schedule_date)}
                        </span>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            toast.promise(
                              printMatchScorebook(rec.record_json),
                              {
                                loading: "Generating Scorebook PDF...",
                                success: "PDF opened in new tab!",
                                error: "Failed to generate PDF",
                              }
                            );
                          }}
                        >
                          <Printer size={12} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </section>
      ) : (
        <LeagueHistoryTable />
      )}
    </Suspense>
  );
}
const defaultTab = "preferences";
export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || defaultTab;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (value: string) => {
    startTransition(() => {
      setActiveTab(value);
      setSearchParams({ tab: value });
    });
  };

  const tab1Content = () => (
    <div className="flex flex-col w-fit">
      <div className="flex items-center gap-3">
        <Label className="whitespace-nowrap">Switch Theme</Label>
        <ModeToggle />
      </div>
    </div>
  );

  return (
    <ContentShell>
      <ContentHeader title="Settings" />
      <ContentBody>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <ScrollArea>
            <TabsList className="text-foreground mb-3 h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1 w-full justify-start">
              <TabsTrigger
                value="preferences"
                className="tab-trigger"
                disabled={isPending}
              >
                Preferences
              </TabsTrigger>

              {ON_NEW_WINDOW && (
                <TabsTrigger
                  value="controls"
                  className="tab-trigger"
                  disabled={isPending}
                >
                  Controls
                </TabsTrigger>
              )}

              <TabsTrigger
                value="leagues"
                className="tab-trigger relative"
                disabled={isPending}
              >
                Leagues
                {isPending && activeTab !== "leagues" && (
                  <Spinner className="ml-2 h-3 w-3 inline-block" />
                )}
              </TabsTrigger>

              <TabsTrigger
                value="categories"
                className="tab-trigger"
                disabled={isPending}
              >
                Categories
              </TabsTrigger>

              <TabsTrigger
                value="organization"
                className="tab-trigger"
                disabled={isPending}
              >
                Organization
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div
            className={`transition-opacity duration-200 ${
              isPending ? "opacity-60" : "opacity-100"
            }`}
          >
            <TabsContent value="preferences">{tab1Content()}</TabsContent>

            <TabsContent value="leagues">
              <LeaguesTabContent />
            </TabsContent>

            <TabsContent value="categories">
              <ManageCategories />
            </TabsContent>

            <TabsContent value="organization">
              <UpdateOrganizationTab />
            </TabsContent>

            {!ON_NEW_WINDOW && (
              <TabsContent value="controls" className="mt-4 space-y-4">
                <h2 className="text-lg font-semibold">Keyboard Controls</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ShortcutItem action="Refresh" keys="Ctrl + R" />
                  <ShortcutItem action="Undo" keys="Ctrl + Z" />
                  <ShortcutItem action="Redo" keys="Ctrl + Shift + Z" />
                  <ShortcutItem action="Save" keys="Ctrl + S" />
                  <ShortcutItem action="Search" keys="Ctrl + F" />
                  <ShortcutItem action="Toggle Sidebar" keys="Ctrl + B" />
                </div>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </ContentBody>
    </ContentShell>
  );
}
