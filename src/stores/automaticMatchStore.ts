import { useToggleStore } from "./toggleStore";

export const useOpenAutomaticMatchesSheet = useToggleStore<{
  round_name: string;
  round_id: string;
}>();
