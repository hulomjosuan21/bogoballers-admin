import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Background, Controls, ReactFlow } from "@xyflow/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AutomaticRoundNodeMenu } from "@/components/automatic-match-config/AutomaticMatchConfigNodeMenu";
import { useAutomaticMatchConfigDragAndDrop } from "@/hooks/useAutomaticMatchConfigHook";
import { AutomaticMatchConfigFlowProvider } from "@/context/AutomaticMatchConfigFlowContext";

export default function AutomaticVersionTwo() {
  // const { onDrop, onDragOver } = useAutomaticMatchConfigDragAndDrop();

  const menu = (
    <div className="w-fit flex flex-col gap-2">
      <Tabs defaultValue="rounds" className="text-xs text-muted-foreground">
        <TabsList size="xs">
          <TabsTrigger value="rounds">Rounds</TabsTrigger>
        </TabsList>
        <TabsContent value="rounds">
          <AutomaticRoundNodeMenu />
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <ContentShell>
      <ContentHeader title="Version 2" />
      <ContentBody className="flex flex-row">
        <div className="h-full border rounded-md w-full bg-background">
          <ReactFlow>
            <Background />
            <Controls />
          </ReactFlow>
        </div>
        {menu}
      </ContentBody>
    </ContentShell>
  );
}
