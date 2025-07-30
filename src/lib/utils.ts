import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function disableOnLoading({
  condition,
  baseClass = "",
  opacity = 10,
}: {
  condition: boolean;
  baseClass?: string;
  opacity?: number;
}): string {
  return [
    baseClass,
    condition && `disable-on-loading-${opacity}`,
    condition && "transition-opacity duration-300 ease-in-out",
  ]
    .filter(Boolean)
    .join(" ");
}
