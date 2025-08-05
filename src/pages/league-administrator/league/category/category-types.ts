import type { LucideIcon } from "lucide-react";

export const CATEGORY_WIDTH = 1280;
export const CATEGORY_HEIGHT = 720;

export type StatusMap = Record<RoundType, string>;

export type RoundType =
  | "Elimination"
  | "Quarterfinals"
  | "Semifinals"
  | "Finals";

export interface RoundNodeData extends Record<string, unknown> {
  icon: LucideIcon;
  label: RoundType;
  status: string;
  onOpen: () => void;
}

export interface CategoryNodeData {
  categoryId: string;
  categoryName: string;
}

export interface RoundDetails {
  label: RoundType;
  formats: string[];
  states: string[];
}

export type RoundBorderColor =
  | "border-cyan-500"
  | "border-sky-500"
  | "border-amber-500"
  | "border-purple-500";

export type RoundMenuItem = {
  label: RoundType;
  icon: LucideIcon;
};
