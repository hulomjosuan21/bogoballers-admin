import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ImageUploadField } from "@/components/image-upload-field";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import InputSelect from "@/components/input-select";
import { toast } from "sonner";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table-pagination";
import type { LeagueOfficial } from "@/types/league";
import { LeagueService } from "@/service/leagueService";
import { useErrorToast } from "@/components/error-toast";
import { useQuery } from "@tanstack/react-query";
import { StaticData } from "@/data";
import { cn } from "@/lib/utils";
import { getActiveLeagueQueryOption } from "@/queries/leagueQueryOption";

export type LeagueCreateOfficialCreate = {
  full_name: string;
  role: string;
  contact_info: string;
  photo: string | File;
};

const UNIQUE_ROLES: string[] = StaticData.UniqueLeagueRoleOfficials;
const MULTIPLE_ROLES: string[] = StaticData.MultiLeagueRoleOfficials;

export default function ManageOfficialsComponent({
  data,
  hasActiveLeague,
}: {
  data: LeagueOfficial[];
  hasActiveLeague: boolean;
}) {
  const { data: activeLeague } = useQuery(getActiveLeagueQueryOption);
  const [officials, setOfficials] =
    useState<LeagueCreateOfficialCreate[]>(data);
  const originalData = useRef<LeagueOfficial[] | LeagueCreateOfficialCreate[]>(
    data
  );
  const [isProcessing, setProcess] = useState(false);
  const [form, setForm] = useState<LeagueCreateOfficialCreate>({
    full_name: "",
    role: "",
    contact_info: "",
    photo: "",
  });
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [hasChanges, setChanges] = useState(false);
  const handleError = useErrorToast();

  const handleChange = (
    key: keyof LeagueCreateOfficialCreate,
    value: string | File | null
  ) => {
    setForm((prev) => ({ ...prev, [key]: value ?? "" }));
  };

  const handleSubmit = () => {
    if (
      !form.full_name.trim() ||
      !form.role.trim() ||
      !form.contact_info.trim() ||
      !form.photo
    ) {
      toast.error("Please complete all fields before submitting.");
      return;
    }

    if (editIndex !== null) {
      const updated = [...officials];
      updated[editIndex] = form;
      setOfficials(updated);
    } else {
      setOfficials((prev) => [...prev, form]);
    }

    setForm({ full_name: "", role: "", contact_info: "", photo: "" });
    setEditIndex(null);
    setOpen(false);
  };

  const handleEdit = (index: number) => {
    setForm(officials[index]);
    setEditIndex(index);
    setOpen(true);
  };

  const handleRemove = (index: number) => {
    setOfficials((prev) => prev.filter((_, i) => i !== index));
  };

  const selectedUniqueRoles = officials
    .filter((_, i) => i !== editIndex)
    .filter((o) => !MULTIPLE_ROLES.includes(o.role))
    .map((o) => o.role);
  const availableRoles = [...UNIQUE_ROLES, ...MULTIPLE_ROLES];

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    const isEqual =
      JSON.stringify(officials) === JSON.stringify(originalData.current);
    setChanges(!isEqual);
  }, [officials]);

  const handleSaveChanges = async () => {
    setProcess(true);
    try {
      const leagueId = activeLeague?.league_id;
      if (!leagueId) {
        throw new Error("No League id");
      }
      const response = await LeagueService.updateSingleLeagueResourceField(
        leagueId,
        "league_officials",
        officials
      );

      toast.success(response.message);
      originalData.current = officials;
      setChanges(false);
    } catch (e) {
      handleError(e);
    } finally {
      setProcess(false);
    }
  };

  const columns: ColumnDef<LeagueCreateOfficialCreate>[] = [
    {
      accessorKey: "photo",
      header: "Photo",
      cell: ({ row }) => {
        const photo = row.original.photo;
        const name = row.original.full_name;
        return (
          <Avatar>
            <AvatarImage
              className="object-cover rounded-sm"
              src={
                typeof photo === "string" ? photo : URL.createObjectURL(photo)
              }
              alt={name}
            />
            <AvatarFallback className="rounded-sm">
              {name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "full_name",
      header: "Full Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("full_name")}</div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      accessorKey: "contact_info",
      header: "Contact Info",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.getValue("contact_info")}
        </span>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const index = row.index;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(index)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRemove(index)}>
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: officials,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div
      className={cn(
        "space-y-2",
        hasActiveLeague && "pointer-events-none opacity-50"
      )}
    >
      <div className="flex justify-between items-center gap-4">
        <p className="text-helper">Manage league officials.</p>
        <div className="flex gap-2 items-center">
          <Dialog
            open={open}
            onOpenChange={(val) => {
              if (!val) {
                setEditIndex(null);
                setForm({
                  full_name: "",
                  role: "",
                  contact_info: "",
                  photo: "",
                });
              }
              setOpen(val);
            }}
          >
            <DialogTrigger asChild>
              <Button
                className={cn(editIndex !== null && "hidden")}
                size={"sm"}
              >
                Add League Official
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>
                  {editIndex !== null ? "Edit" : "Add"} League Official
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Full Name</Label>
                  <Input
                    value={form.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Role</Label>
                  <InputSelect
                    value={form.role}
                    onChange={(val) => handleChange("role", val)}
                    options={availableRoles.filter(
                      (role) =>
                        !(
                          UNIQUE_ROLES.includes(role) &&
                          selectedUniqueRoles.includes(role) &&
                          role !== form.role
                        )
                    )}
                    placeholder="Select role"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Contact Info</Label>
                  <Input
                    value={form.contact_info}
                    onChange={(e) =>
                      handleChange("contact_info", e.target.value)
                    }
                    placeholder="Email or Phone"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Photo</Label>
                  <ImageUploadField
                    value={form.photo}
                    onChange={(file) => handleChange("photo", file)}
                    allowUpload
                    allowEmbed
                    iconOnly={false}
                    aspect={1}
                  />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button onClick={handleSubmit} className="w-full">
                  Continue
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {hasChanges && (
            <Button
              variant={"outline"}
              onClick={handleSaveChanges}
              disabled={isProcessing}
              size={"sm"}
            >
              Save Changes
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No officials added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination showPageSize={false} table={table} />
    </div>
  );
}
