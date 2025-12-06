import { ModeToggle } from "@/components/mode-toggle";
import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManageCategories from "./league/ManageCategories";
import UpdateOrganizationTab from "@/components/UpdateOrganization";
import { useState, useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ShortcutItem } from "@/components/shortCutItem";

import { useSearchParams } from "react-router-dom";
import { LeaguesTabContent } from "./LeagueRecordPage";
import { PendingLeagueAlert } from "@/components/LeagueStatusAlert";
import useActiveLeagueMeta from "@/hooks/useActiveLeagueMeta";
const ON_NEW_WINDOW = import.meta.env.VITE_NEW_WINDOW === "true";

const defaultTab = "preferences";
export default function SettingsPage() {
  const { isActive, league_status } = useActiveLeagueMeta();
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
        {isActive && league_status === "Pending" && (
          <PendingLeagueAlert onContentBody={false} />
        )}
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
