import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AutomaticFormatNodeMenu,
  AutomaticRoundNodeMenu,
} from "@/components/automatic-match-config/AutomaticMatchConfigNodeMenu";
import AutomaticMatchConfigXyFlowCanvas from "./AutomaticMatchConfigXyFlowCanvas";
import { AutomaticMatchConfigFlowProvider } from "@/context/AutomaticMatchConfigFlowContext";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft } from "lucide-react";

function AutomaticMatchConfigPage() {
  const menu = (
    <div className="w-48 flex flex-col gap-2">
      <Tabs defaultValue="rounds" className="text-xs text-muted-foreground">
        <TabsList size="xs">
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

  return (
    <ContentShell>
      <ContentHeader title="Automatic Configuration">
        <Button size="sm" className="">
          <ArrowRightLeft className="w-4 h-4" />
          Sync
        </Button>
      </ContentHeader>
      <ContentBody className="flex flex-row">
        <AutomaticMatchConfigXyFlowCanvas />
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
