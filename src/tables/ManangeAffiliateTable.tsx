import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  flexRender,
} from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/image-upload-field";
import { DataTablePagination } from "@/components/data-table-pagination";
import { useEffect, useRef, useState } from "react";
import type { LeagueAffiliate } from "@/types/league";
import { useErrorToast } from "@/components/error-toast";
import { LeagueService } from "@/service/leagueService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type LeagueAffiliateCreate = {
  name: string;
  value: string;
  image: File | string;
  contact_info: string;
};

export default function ManageAffiliates({
  data,
  activeLeagueId,
  isActive = true,
}: {
  data: LeagueAffiliate[];
  activeLeagueId: string;
  isActive?: boolean;
}) {
  const handleError = useErrorToast();
  const [isProcessing, setProcess] = useState(false);
  const [affiliates, setAffiliates] = useState<LeagueAffiliateCreate[]>(data);
  const originalData = useRef<LeagueAffiliate[] | LeagueAffiliateCreate[]>(
    data
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    actions: isActive,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [hasChanges, setChanges] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<LeagueAffiliateCreate>({
    name: "",
    value: "",
    image: "",
    contact_info: "",
  });

  const handleChange = (key: keyof LeagueAffiliateCreate, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddOrUpdate = () => {
    if (editingIndex !== null) {
      setAffiliates((prev) =>
        prev.map((item, idx) => (idx === editingIndex ? form : item))
      );
    } else {
      setAffiliates((prev) => [...prev, form]);
    }
    setForm({ name: "", value: "", image: "", contact_info: "" });
    setEditingIndex(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (index: number) => {
    setForm(affiliates[index]);
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    setAffiliates((prev) => prev.filter((_, idx) => idx !== index));
  };

  useEffect(() => {
    const isEqual =
      JSON.stringify(affiliates) === JSON.stringify(originalData.current);
    setChanges(!isEqual);
  }, [affiliates]);

  const handleSaveChanges = async () => {
    setProcess(true);
    try {
      const response = await LeagueService.updateSingleLeagueResourceField(
        activeLeagueId,
        "league_affiliates",
        affiliates
      );

      toast.success(response.message);
      originalData.current = affiliates;
      setChanges(false);
    } catch (e) {
      handleError(e);
    } finally {
      setProcess(false);
    }
  };

  const columns: ColumnDef<LeagueAffiliateCreate>[] = [
    {
      accessorKey: "photo",
      header: "Photo",
      cell: ({ row }) => {
        const photo = row.original.image;
        const name = row.original.name;
        return (
          <Avatar>
            <AvatarImage
              className="object-cover rounded-sm"
              src={
                typeof photo === "string" && photo.trim() !== ""
                  ? photo
                  : undefined
              }
              alt={name}
            />
            <AvatarFallback className="rounded-sm">
              {name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "value",
      header: "Value",
    },
    {
      accessorKey: "contact_info",
      header: "Contact",
    },
    {
      id: "actions",
      enableHiding: true,
      cell: ({ row }) => {
        const index = row.index;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(index)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(index)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: affiliates,
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
    <div className="space-y-2">
      <div className="flex justify-between items-center gap-4">
        <p className="text-helper">Manage league sponsors and partners.</p>
        <div className="flex gap-2 items-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className={cn(editingIndex !== null && "hidden")}
                size={"sm"}
              >
                Add
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>
                  {editingIndex !== null ? "Edit Affiliate" : "Add Affiliate"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Contribution</Label>
                  <Input
                    id="value"
                    value={form.value}
                    onChange={(e) => handleChange("value", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_info">Contact</Label>
                  <Input
                    placeholder="Enter phone, email, or website"
                    id="contact_info"
                    value={form.contact_info}
                    onChange={(e) =>
                      handleChange("contact_info", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Photo</Label>
                  <ImageUploadField
                    value={form.image}
                    onChange={(file) => handleChange("image", file as string)}
                  />
                </div>
                <Button onClick={handleAddOrUpdate} className="w-full">
                  Continue
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {hasChanges && (
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={handleSaveChanges}
              disabled={isProcessing}
            >
              Save Changes
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                  No affiliates added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination showPageSize={true} table={table} />
    </div>
  );
}
