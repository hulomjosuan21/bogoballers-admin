import type { DragEvent, FC, ReactNode } from "react";

const DraggableNode: FC<{ nodeType: string; children: ReactNode }> = ({
  nodeType,
  children,
}) => {
  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow-nodetype", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      onDragStart={(event) => onDragStart(event, nodeType)}
      draggable
      className="p-2 my-1 border rounded-lg cursor-grab bg-background hover:bg-muted active:cursor-grabbing text-center"
    >
      {children}
    </div>
  );
};

// The main component for the node creation sidebar
export const ManualNodeMenus = () => {
  return (
    <aside className="p-4 h-full">
      <div className="card border bg-card text-card-foreground shadow-xl h-full flex flex-col">
        <div className="card-header p-3 border-b">
          <h2 className="card-title font-bold">Add Nodes</h2>
        </div>
        <div className="card-content p-2 overflow-y-auto">
          <DraggableNode nodeType="leagueCategory">Category</DraggableNode>
          <DraggableNode nodeType="leagueCategoryRound">Round</DraggableNode>
          <DraggableNode nodeType="leagueMatch">Match</DraggableNode>
        </div>
      </div>
    </aside>
  );
};
