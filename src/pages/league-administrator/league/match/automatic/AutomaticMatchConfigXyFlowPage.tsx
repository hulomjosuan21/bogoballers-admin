import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AutomaticFormatNodeMenu,
  AutomaticRoundNodeMenu,
} from "@/components/automatic-match-config/AutomaticMatchConfigNodeMenu";
import { AutomaticMatchConfigFlowProvider } from "@/context/AutomaticMatchConfigFlowContext";
import { AutomaticMatchConfigXyFlowCanvas } from "./AutomaticMatchConfigXyFlowCanvas";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { Spinner } from "@/components/ui/spinner";

function AutomaticMatchConfigPage() {
  const { activeLeagueId, activeLeagueLoading, activeLeagueError } =
    useActiveLeague();

  const menu = (
    <div className="w-48 flex flex-col gap-2">
      <Tabs defaultValue="rounds" className="text-xs text-muted-foreground">
        <TabsList size="xs" className="grid w-full grid-cols-2">
          <TabsTrigger value="rounds">Rounds</TabsTrigger>
          <TabsTrigger value="formats">Formats</TabsTrigger>
        </TabsList>
        <TabsContent value="rounds">
          <AutomaticRoundNodeMenu />
        </TabsContent>
        <TabsContent value="formats">
          <AutomaticFormatNodeMenu />
        </TabsContent>
      </Tabs>
    </div>
  );

  if (activeLeagueLoading) {
    return (
      <div className="h-screen grid place-content-center">
        <Spinner />
      </div>
    );
  }

  if (activeLeagueError) {
    return (
      <div className="h-screen grid place-content-center">
        <p className="text-sm text-red-500">
          {activeLeagueError.message || "Error loading config"}
        </p>
      </div>
    );
  }

  return (
    <ContentShell>
      <ContentHeader title="Automatic Configuration" />
      <ContentBody className="flex flex-row">
        <AutomaticMatchConfigXyFlowCanvas activeLeagueId={activeLeagueId} />
        {menu}
      </ContentBody>
    </ContentShell>
  );
}

export default function AutomaticMatchConfigContent() {
  return (
    <AutomaticMatchConfigFlowProvider>
      <AutomaticMatchConfigPage />
    </AutomaticMatchConfigFlowProvider>
  );
}
