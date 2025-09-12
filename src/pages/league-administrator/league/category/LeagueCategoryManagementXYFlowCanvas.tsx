import { ReactFlow, Background, Controls, BezierEdge } from "@xyflow/react";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  CategoryNode,
  FormatNode,
  RoundNode,
} from "@/components/league-category-management/leagueCategoryManagementNodes";
import {
  FormatNodeMenu,
  RoundNodeMenu,
} from "@/components/league-category-management/leagueCategoryManagementMenu";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { default as ContentHeader } from "@/components/content-header";
import { Button } from "@/components/ui/button";
import { Loader2, Menu } from "lucide-react";
import type { LeagueCategory } from "@/types/leagueCategoryTypes";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useNodeManagement } from "@/hooks/league-category-management/useNodeManagement";
import { useEdgeStyling } from "@/hooks/league-category-management/useEdgeStyling";
import { useKeyboardShortcuts } from "@/hooks/league-category-management/useKeyboardShortcuts";
import { useDragDropActions } from "@/hooks/league-category-management/useDragDropActions";
import { useSaveOperations } from "@/hooks/league-category-management/useSaveOperations";
import { NoteBox } from "@/components/nodebox";

type LeagueCategoryCanvasProps = {
  categories?: LeagueCategory[] | null;
  isLoading: boolean;
  error: unknown;

  viewOnly?: boolean;
};
const nTeams = 8;

export default function LeagueCategoryCanvas({
  categories,
  isLoading,
  error,
  viewOnly = false,
}: LeagueCategoryCanvasProps) {
  const {
    nodes,
    edges,
    selectedNodes,
    originalNodesRef,
    initialNodesRef,
    categoriesRef,
    setEdges,
    setDeletedNodeIds,
    initializeFromCategories,
    getChangedNodes,
    getDeletedNodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeDragStop,
    onSelectionChange,
    deleteSelectedNodes,
    onDrop,
    hasUnsavedChanges,
    getTotalChangesCount,
  } = useNodeManagement({ categories, viewOnly, nTeams: nTeams });

  useEdgeStyling({ nodes, setEdges });

  useKeyboardShortcuts({
    deleteSelectedNodes,
    selectedNodesCount: selectedNodes.length,
    viewOnly,
  });

  const { onDragStart, onDragOver } = useDragDropActions({ viewOnly });

  const { saveChanges } = useSaveOperations({
    getChangedNodes,
    getDeletedNodes,
    nodes,
    initialNodesRef,
    setDeletedNodeIds,
  });

  useEffect(() => {
    initializeFromCategories();
  }, [initializeFromCategories]);

  const handleSaveChanges = async () => {
    const result = await saveChanges();
    if (!result.success && result.message === "No changes to save") {
      toast.info(result.message);
    }
  };

  const nodeTypes = useMemo(
    () => ({
      categoryNode: CategoryNode,
      roundNode: (props: any) => (
        <RoundNode {...props} allNodesRef={originalNodesRef} />
      ),
      formatNode: FormatNode,
    }),
    [originalNodesRef]
  );

  const eventHandlers = useMemo(() => {
    if (viewOnly) {
      return {
        onNodesChange: undefined,
        onEdgesChange: undefined,
        onConnect: undefined,
        onDrop: undefined,
        onNodeDragStop: undefined,
        onSelectionChange: undefined,
        onDragOver: undefined,
      };
    }

    return {
      onNodesChange,
      onEdgesChange,
      onConnect,
      onDrop,
      onNodeDragStop,
      onSelectionChange,
      onDragOver,
    };
  }, [
    viewOnly,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDrop,
    onNodeDragStop,
    onSelectionChange,
    onDragOver,
  ]);

  const categoryCanvas = (
    <>
      <div className="h-full border rounded-md w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          edgeTypes={{
            bezier: BezierEdge,
          }}
          nodeTypes={nodeTypes}
          {...eventHandlers}
          fitView
          panOnDrag
          minZoom={0.2}
          maxZoom={2}
        >
          <Background />
          <Controls className="node-menu-button" />
        </ReactFlow>
      </div>

      {!viewOnly && (
        <div className="flex flex-col gap-4">
          <RoundNodeMenu
            onDragStart={(e, label) => onDragStart(e, "round", label)}
          />
          <FormatNodeMenu
            nTeam={nTeams}
            onDragStart={(e, label) => onDragStart(e, "format", label)}
          />
        </div>
      )}
    </>
  );

  return (
    <ContentShell>
      <ContentHeader title="Category Management">
        {!viewOnly && hasUnsavedChanges && (
          <Button variant={"outline"} size={"sm"} onClick={handleSaveChanges}>
            Save Changes ({getTotalChangesCount})
          </Button>
        )}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant={"outline"} size={"sm"}>
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side={"top"} aria-describedby={undefined}>
            <SheetHeader>
              <SheetTitle />
            </SheetHeader>

            <div className="mt-4 space-y-2">
              <NoteBox label="Test">0</NoteBox>
              <NoteBox label="Test">0</NoteBox>
            </div>
          </SheetContent>
        </Sheet>
      </ContentHeader>
      <ContentBody className="flex-row">
        {isLoading ? (
          <div className="centered-container">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="centered-container">
            <p className="text-primary">{(error as any).message}</p>
          </div>
        ) : categoriesRef.current && categoriesRef.current.length > 0 ? (
          categoryCanvas
        ) : (
          <div className="centered-container">
            <p className="text-muted-foreground">No categories available</p>
          </div>
        )}
      </ContentBody>
    </ContentShell>
  );
}
