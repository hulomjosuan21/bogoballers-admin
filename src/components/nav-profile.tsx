"use client"

import {
    BadgeCheck,
    ChevronsUpDown,
    LogOut,
    Loader2,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
// import { useLogout } from "@/lib/logout"
import { useState } from "react"
import type { LeagueAdminType } from "@/models/league-administrator"

export function NavUser({ admin }: { admin: LeagueAdminType }) {
    const { isMobile } = useSidebar()
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const handleLogout = async () => {
        setIsLoggingOut(true)
        // try {

        // } finally {
        //     setIsLoggingOut(false)
        // }
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={admin.organization_logo_url} alt="logo" className="object-cover" />
                                <AvatarFallback className="rounded-lg">BB</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{admin.organization_name}</span>
                                <span className="truncate text-xs">{admin.user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={admin.organization_name} alt="org name" />
                                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{admin.organization_name}</span>
                                    <span className="truncate text-xs">{admin.user.email}</span>
                                    <span className="truncate text-xs text-muted-foreground">{admin.organization_address}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <BadgeCheck />
                                About Organization
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                            <LogOut className="mr-2" />
                            Log out
                            {isLoggingOut && <Loader2 className="ml-auto h-4 w-4 animate-spin text-muted-foreground" />}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}