import { ModeToggle } from "@/components/mode-toggle";
import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManageCategories from "./league/ManageCategories";
import UpdateOrganizationTab from "@/components/UpdateOrganization";
import { Suspense } from "react";
import LeagueHistoryTable from "@/tables/LeagueHistoryTable";
import { Spinner } from "@/components/ui/spinner";
import { ShortcutItem } from "@/components/shortCutItem";
const ON_NEW_WINDOW = import.meta.env.VITE_NEW_WINDOW === "true";
export default function SettingsPage() {
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
      <ContentHeader title="Settings"></ContentHeader>
      <ContentBody>
        <Tabs defaultValue="preferences">
          <ScrollArea>
            <TabsList className="text-foreground mb-3 h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1 w-full justify-start">
              <TabsTrigger value="preferences" className="tab-trigger">
                Preferences
              </TabsTrigger>
              {ON_NEW_WINDOW && (
                <TabsTrigger value="controls" className="tab-trigger">
                  Controls
                </TabsTrigger>
              )}
              <TabsTrigger value="leagues" className="tab-trigger">
                Leagues
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
          <TabsContent value="leagues">
            <Suspense
              key="league-history"
              fallback={
                <div className="h-40 grid place-content-center">
                  <Spinner />
                </div>
              }
            >
              <LeagueHistoryTable />
            </Suspense>
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
                {/* Add more here */}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </ContentBody>
    </ContentShell>
  );
}
