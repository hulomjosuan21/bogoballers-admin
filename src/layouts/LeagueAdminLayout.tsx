import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

export default function LeagueAdminLayout() {
    return (
        <SidebarProvider>
            <main className="flex h-screen w-screen overflow-hidden">
                <AppSidebar />
                <main className="flex-1 h-full w-full overflow-auto">
                    <Outlet />
                </main>
            </main>
        </SidebarProvider>
    )
}
