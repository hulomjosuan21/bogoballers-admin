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

export function generateUUIDWithPrefix(prefix: string): string {
  const uuid = crypto.randomUUID();
  return `${prefix}-${uuid}`;
}
