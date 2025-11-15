export function ShortcutItem({
  action,
  keys,
}: {
  action: string;
  keys: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <span className="text-sm font-medium">{action}</span>
      <kbd className="kbd-hint">{keys}</kbd>
    </div>
  );
}
