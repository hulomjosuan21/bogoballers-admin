import type { MatchBook } from "@/types/scorebook";
import { useToggleStore } from "./toggleStore";

export const useToggleMatchBookSection = useToggleStore<MatchBook>();
