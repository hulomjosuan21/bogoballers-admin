import type { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactFlowProvider } from "@xyflow/react";
import { AlertDialogProvider } from "@/hooks/user-alert-dialog";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <ReactFlowProvider>
          <AlertDialogProvider>{children}</AlertDialogProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </ReactFlowProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
