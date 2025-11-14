import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { LeagueAdministator } from "@/types/leagueAdmin";

export type AdminColumnsProps = {
  onToggleOperational: (adminId: string) => void;
  togglingAdminId: string | null;
};

export const getAdminColumns = ({
  onToggleOperational,
  togglingAdminId,
}: AdminColumnsProps): ColumnDef<LeagueAdministator>[] => [
  {
    accessorKey: "organization_name",
    header: "Organization",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage
            src={row.original.organization_logo_url}
            alt={row.original.organization_name}
          />
          <AvatarFallback>
            {row.original.organization_name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{row.original.organization_name}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.account.email}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "organization_type",
    header: "Type",
  },
  {
    accessorKey: "is_operational",
    header: "Operational",
    cell: ({ row }) => {
      const admin = row.original;
      const isLoading = togglingAdminId === admin.league_administrator_id;

      return (
        <div className="flex items-center gap-2 w-24">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Switch
              checked={admin.is_operational}
              onCheckedChange={() =>
                onToggleOperational(admin.league_administrator_id)
              }
              aria-label="Toggle operational status"
            />
          )}
          <Badge variant={admin.is_operational ? "default" : "outline"}>
            {admin.is_operational ? "Yes" : "No"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "account.is_verified",
    header: "Verified",
    cell: ({ row }) =>
      row.original.account.is_verified ? (
        <Badge variant="secondary">Verified</Badge>
      ) : (
        <Badge variant="destructive">Not Verified</Badge>
      ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const admin = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(admin.account.email);
                toast.info("Email copied to clipboard");
              }}
            >
              Copy Email
            </DropdownMenuItem>
            <DropdownMenuItem>View Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
