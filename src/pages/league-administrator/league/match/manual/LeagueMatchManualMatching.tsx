import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlowProvider } from "@/context/FlowContext";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ContentHeader from "@/components/content-header";
import {
  ManualEmptyLeagueMatchNode,
  ManualLeagueCategoryNodeMenu,
  ManualLeagueTeamNodeMenu,
  ManualRoundNodeMenu,
} from "@/components/manual/menus";
import { ManualMatchingCanvas } from "./LeagueMatchManualXyFlowCanvas";

function ManualMatchingPageContent() {
  const rightMenu = (
    <div className="w-fit flex flex-col gap-2">
      <ManualEmptyLeagueMatchNode leagueId="" />
      <Tabs
        defaultValue="category"
        className="w-fit text-xs text-muted-foreground"
      >
        <TabsList size="xs">
          <TabsTrigger value="category">Category</TabsTrigger>
          <TabsTrigger value="round">Round</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>
        <TabsContent value="category">
          <ManualLeagueCategoryNodeMenu />
        </TabsContent>
        <TabsContent value="round">
          <ManualRoundNodeMenu />
        </TabsContent>
        <TabsContent value="teams">
          <ManualLeagueTeamNodeMenu />
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <ContentShell>
      <ContentHeader title="Manual Matching" />
      <ContentBody className="flex-row ">
        <ManualMatchingCanvas />
        {rightMenu}
      </ContentBody>
    </ContentShell>
  );
}

export default function ManualMatchingPage() {
  return (
    <FlowProvider>
      <ManualMatchingPageContent />
    </FlowProvider>
  );
}
