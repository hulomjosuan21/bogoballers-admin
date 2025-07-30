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
    `transition-opacity duration-300 ease-in-out`,
    condition && `disable-on-loading-${opacity}`,
  ]
    .filter(Boolean)
    .join(" ");
}