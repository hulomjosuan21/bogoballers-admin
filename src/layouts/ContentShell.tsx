import { type ReactNode } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface PageShellProps {
    children: ReactNode;
}

export function ContentShell({ children }: PageShellProps) {
    return (
        <SidebarInset>
            <div className="flex flex-col h-screen w-full">
                {children}
            </div>
        </SidebarInset>
    );
}

interface ContentBodyProps {
    children?: ReactNode;
    className?: string;
}

export function ContentBody({ children, className }: ContentBodyProps) {
    return (
        <div className={cn("flex-1 overflow-y-auto p-4 flex flex-col gap-4", className)}>
            {children || null}
        </div>
    );
}