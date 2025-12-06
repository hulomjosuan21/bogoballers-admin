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

export function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return n.toLocaleString();
  return n.toString();
}

export function formatDate12h(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, "0");

  let hours = date.getHours();
  const minutes = pad(date.getMinutes());
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )} ` + `${pad(hours)}:${minutes} ${ampm}`
  );
}

export function getOrdinal(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}
