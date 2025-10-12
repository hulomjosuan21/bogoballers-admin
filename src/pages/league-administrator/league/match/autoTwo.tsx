import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Background, Controls, ReactFlow } from "@xyflow/react";

export default function AutomaticVersionTwo() {
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
      </ContentBody>
    </ContentShell>
  );
}
