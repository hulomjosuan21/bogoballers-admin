import { RoundStateEnum, RoundTypeEnum } from "./types";

export { useCallback, useEffect, useMemo, useRef, useState } from "react";
export { ApiResponse } from "@/lib/apiResponse";

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

export { toast } from "sonner";
export { useErrorToast } from "@/components/error-toast";

export { CategoryNode, FormatNode, RoundNode } from "./nodes";

export { ContentBody, ContentShell } from "@/layouts/ContentShell";
export { default as ContentHeader } from "@/components/content-header";

export { FormatNodeMenu, RoundNodeMenu } from "./menus";

export { AddCategoryDialog, RoundNodeSheet } from "./components";
export { NoteBox } from "@/components/nodebox";

export { useQuery, useQueries } from "@tanstack/react-query";
export { getActiveLeagueQueryOptions } from "@/queries/league";

export { Loader2, Settings2, GripVertical } from "lucide-react";

export { ButtonLoading } from "@/components/custom-buttons";
export { Button } from "@/components/ui/button";
export { Checkbox } from "@/components/ui/checkbox";
export { Input } from "@/components/ui/input";
export { Label } from "@/components/ui/label";

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
} from "@/components/ui/alert";
export { RiSpamFill } from "@remixicon/react";
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

export { StaticData } from "@/data";

export { LeagueCategoryService } from "./service";
export { LeagueService } from "@/service/league-service";

export { generateUUIDWithPrefix } from "@/lib/app_utils";

export type { CreateLeagueCategory } from "./types";

export const STATUSES: Record<RoundTypeEnum, RoundStateEnum> = {
  [RoundTypeEnum.Elimination]: RoundStateEnum.Upcoming,
  [RoundTypeEnum.QuarterFinal]: RoundStateEnum.Upcoming,
  [RoundTypeEnum.SemiFinal]: RoundStateEnum.Upcoming,
  [RoundTypeEnum.Final]: RoundStateEnum.Upcoming,
};
