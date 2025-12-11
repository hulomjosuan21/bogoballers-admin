import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown} from "lucide-react";
import { Button } from "@/components/ui/button";

import type { Staff } from "@/service/leagueAdminStaffServie";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate12h } from "@/lib/app_utils";
import { StaffRowActions } from "./staff-row-actions";

export const columns: ColumnDef<Staff>[] = [
  {
    accessorKey: "username",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Username
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "full_name",
    header: "Full Name",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("full_name")}</div>
    ),
  },
  {
    accessorKey: "contact_info",
    header: "Contact Info",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("contact_info")}</div>
    ),
  },
  {
    accessorKey: "role_label",
    header: "Role",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("role_label")}</div>
    ),
  },
  {
    accessorKey: "staff_created_at",
    header: "Added at",
    cell: ({ row }) => <div>{formatDate12h(row.getValue("staff_created_at"))}</div>,
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      const perms = row.original.permissions as string[];
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              {perms?.length || 0} Access Points
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-48">
            <div className="stat-list-compact">
              {perms.map((op, i) => (
                <div key={i} className="stat-item-compact">
                  <span className="stat-label-compact">{i + 1}.</span>
                  <span className="stat-value-compact">{op}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <StaffRowActions row={row} />,
  },
];
