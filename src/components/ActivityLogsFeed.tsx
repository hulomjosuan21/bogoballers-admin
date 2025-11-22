import { forwardRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { History, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeagueLog } from "@/types/leagueLogModel";

interface ActivityLogsFeedProps {
  logs: LeagueLog[];
  isLoading?: boolean;

  error?: string | Error | null;

  height?:
    | "h-64"
    | "h-80"
    | "h-96"
    | "h-screen"
    | "h-full"
    | `h-[${string}]`
    | "min-h-full";
  className?: string;
}

export const ActivityLogsFeed = forwardRef<
  HTMLDivElement,
  ActivityLogsFeedProps
>(
  (
    { logs = [], isLoading = false, error = null, height = "h-96", className },
    ref
  ) => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
          <AlertTriangle className="w-10 h-10 mb-3 text-destructive/70" />
          <p className="text-sm font-medium text-destructive">
            Failed to load activity
          </p>
          <p className="text-xs mt-1 max-w-xs text-center">
            {typeof error === "string"
              ? error
              : error?.message || "Unknown error"}
          </p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <ScrollArea className={cn("w-full", height, className)}>
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 border-b border-border pb-4 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ))}
          </div>
        </ScrollArea>
      );
    }

    // Empty state (no logs)
    if (logs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
          <History className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-sm font-medium">No activity recorded</p>
          <p className="text-xs opacity-70 mt-1">
            System actions will appear here when they happen.
          </p>
        </div>
      );
    }

    // Actual logs
    return (
      <ScrollArea ref={ref} className={cn("w-full", height, className)}>
        <div className="p-4 space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex flex-col gap-1.5 border-b border-border pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize text-[10px] h-5 px-1.5 font-normal",
                    log.action === "generate" &&
                      "border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/30",
                    log.action === "progress" &&
                      "border-green-300 text-green-700 bg-green-50 dark:bg-green-950/30",
                    log.action === "reset" &&
                      "border-red-300 text-red-700 bg-red-50 dark:bg-red-950/30",
                    log.action === "complete" &&
                      "border-purple-300 text-purple-700 bg-purple-50 dark:bg-purple-950/30"
                  )}
                >
                  {log.action}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(log.created_at).toLocaleString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-foreground/90">
                {log.message}
              </p>

              {log.meta && Object.keys(log.meta).length > 0 && (
                <div className="mt-2 text-xs space-y-1">
                  {Object.entries(log.meta).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-start gap-2 text-muted-foreground"
                    >
                      <span className="font-medium capitalize min-w-24">
                        {key.replace(/_/g, " ")}:
                      </span>
                      <span className="font-mono break-all">
                        {typeof value === "object" && value !== null
                          ? JSON.stringify(value)
                          : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  }
);

ActivityLogsFeed.displayName = "ActivityLogsFeed";
