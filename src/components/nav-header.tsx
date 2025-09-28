import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import logoMain from "@/assets/logo-main.png";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";

export function AppSidebarHeader() {
  const navigate = useNavigate();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={() => navigate("/")}
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={logoMain} alt="logo" />
            <AvatarFallback className="rounded-lg">BB</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">BogoBallers</span>
            <span className="truncate text-xs">League Administrator</span>
          </div>
        </SidebarMenuButton>
        <div className="relative flex-1 mt-2">
          <Input
            className="peer ps-6 pe-2 w-full"
            placeholder="Search..."
            type="search"
            onFocus={() => setTimeout(() => navigate("/find"), 300)}
          />
          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">
            <SearchIcon size={16} />
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
