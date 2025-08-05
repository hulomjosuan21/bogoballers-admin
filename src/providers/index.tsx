import type { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactFlowProvider } from "@xyflow/react";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <ReactFlowProvider>{children}</ReactFlowProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
