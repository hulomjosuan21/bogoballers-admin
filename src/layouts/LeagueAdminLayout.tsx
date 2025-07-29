import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet";

export default function LeagueAdminLayout() {
    return (
        <>
            <Helmet>
                <title>BogoBallers | League Administrator</title>
                <meta name="description" content="Manage your league settings and submissions here." />
            </Helmet>
            <SidebarProvider>
                <main className="flex h-screen w-screen overflow-hidden">
                    <AppSidebar />
                    <main className="flex-1 h-full w-full overflow-auto">
                        <Outlet />
                    </main>
                </main>
            </SidebarProvider>
        </>
    )
}
