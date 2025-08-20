// --------------------
// React hooks
// --------------------
export { useCallback, useEffect, useMemo, useRef, useState } from "react";

// --------------------
// React Flow
// --------------------
export {
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  useReactFlow,
  BezierEdge,
  Handle,
  Position,
} from "@xyflow/react";

// --------------------
// Types
// --------------------
export {
  type FormatNodeData,
  type LeagueCategoryRound,
  type LeagueRoundFormat,
  type NodeData,
  type RoundNodeData,
  getRoundOrder,
  isValidOrderTransition,
  RoundFormatTypesEnum,
  RoundStateEnum,
  RoundTypeEnum,
  type LeagueCategory,
  getRoundTypeByOrder,
  type CategoryNodeData,
  type SaveChangesPayload,
} from "./types";
// --------------------
// Toast
// --------------------
export { toast } from "sonner";
export { useErrorToast } from "@/components/error-toast";

// --------------------
// Nodes
// --------------------
export { CategoryNode, FormatNode, RoundNode } from "./nodes";

// --------------------
// Layouts
// --------------------
export { ContentBody, ContentShell } from "@/layouts/ContentShell";
export { default as ContentHeader } from "@/components/content-header";

// --------------------
// Menus
// --------------------
export { FormatNodeMenu, RoundNodeMenu } from "./menus";

// --------------------
// Components
// --------------------
export { AddCategoryDialog, RoundNodeSheet } from "./components";
export { NoteBox } from "@/components/nodebox";

// --------------------
// React Query
// --------------------
export { useQuery } from "@tanstack/react-query";
export { getActiveLeagueQueryOptions } from "@/queries/league";

// --------------------
// Icons
// --------------------
export { Loader2, Settings2, GripVertical } from "lucide-react";

// --------------------
// Custom UI
// --------------------
export { ButtonLoading } from "@/components/custom-buttons";
export { Button } from "@/components/ui/button";
export { Checkbox } from "@/components/ui/checkbox";
export { Input } from "@/components/ui/input";
export { Label } from "@/components/ui/label";

export {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// --------------------
// Data
// --------------------
export { StaticData } from "@/data";

// --------------------
// Services
// --------------------
export { LeagueCategoryService } from "./service";
export { LeagueService } from "@/service/league-service";

// --------------------
// Utils
// --------------------
export { generateUUIDWithPrefix } from "@/lib/app_utils";

export type { CreateLeagueCategory } from "@/types/league";

export const CATEGORY_WIDTH = 1280;
export const CATEGORY_HEIGHT = 720;
