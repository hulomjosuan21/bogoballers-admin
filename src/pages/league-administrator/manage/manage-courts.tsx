import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
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
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DataTablePagination } from "@/components/data-table-pagination";
import { useEffect, useRef, useState } from "react";
import type { LeagueCourt } from "@/types/league";
import { getActiveLeagueQueryOptions } from "@/queries/league";
import { useQuery } from "@tanstack/react-query";
import { useErrorToast } from "@/components/error-toast";
import LeagueService from "@/service/league-service";
import { ButtonLoading, SmallButton } from "@/components/custom-buttons";
import { cn } from "@/lib/utils";

export default function ManageCourts({ data }: { data: LeagueCourt[] }) {
  const { data: activeLeague } = useQuery(getActiveLeagueQueryOptions);
  const handleError = useErrorToast();
  const [isProcessing, setProcess] = useState(false);
  const [courts, setCourts] = useState<LeagueCourt[]>(data);
  const originalData = useRef<LeagueCourt[]>(data);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [hasChanges, setChanges] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<LeagueCourt>({
    name: "",
    location: "",
    is_available: true,
  });

  const handleChange = (key: keyof LeagueCourt, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.location.trim()) {
      toast.error("Please complete all fields before submitting.");
      return;
    }

    if (editIndex !== null) {
      const updated = [...courts];
      updated[editIndex] = form;
      setCourts(updated);
    } else {
      setCourts((prev) => [...prev, form]);
    }

    setForm({ name: "", location: "", is_available: true });
    setEditIndex(null);
    setOpen(false);
  };

  const handleEdit = (index: number) => {
    setForm(courts[index]);
    setEditIndex(index);
    setOpen(true);
  };

  const handleRemove = (index: number) => {
    setCourts((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const isEqual =
      JSON.stringify(courts) === JSON.stringify(originalData.current);
    setChanges(!isEqual);
  }, [courts]);

  const handleSaveChanges = async () => {
    setProcess(true);
    try {
      const leagueId = activeLeague?.league_id;
      if (!leagueId) {
        throw new Error("No League id");
      }
      const response = await LeagueService.updateSingleLeagueResourceField(
        leagueId,
        "league_courts",
        courts
      );
      toast.success(response.message);
      originalData.current = courts;
      setChanges(false);
    } catch (e) {
      handleError(e);
    } finally {
      setProcess(false);
    }
  };

  const columns: ColumnDef<LeagueCourt>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue("location")}</div>
      ),
    },
    {
      accessorKey: "is_available",
      header: "Available",
      cell: ({ row }) => {
        const idx = row.index;
        return (
          <Switch
            checked={row.original.is_available}
            onCheckedChange={(val) => {
              setCourts((prev) => {
                const updated = [...prev];
                updated[idx] = {
                  ...updated[idx],
                  is_available: val,
                };
                return updated;
              });
            }}
          />
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const idx = row.index;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(idx)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRemove(idx)}>
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
    data: courts,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center gap-4">
        <p className="text-helper">
          Manage courts and their availability for games.
        </p>
        <div className="flex gap-2 items-center">
          <Dialog
            open={open}
            onOpenChange={(val) => {
              if (!val) {
                setEditIndex(null);
                setForm({ name: "", location: "", is_available: true });
              }
              setOpen(val);
            }}
          >
            <DialogTrigger asChild>
              <SmallButton className={cn(editIndex !== null && "hidden")}>
                Add Court
              </SmallButton>
            </DialogTrigger>
            <DialogContent className="max-w-md" aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>
                  {editIndex !== null ? "Edit" : "Add"} Court
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Court address or description"
                  />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button onClick={handleSubmit} className="w-full">
                  {editIndex !== null ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {hasChanges && (
            <SmallButton
              variant={"outline"}
              onClick={handleSaveChanges}
              disabled={isProcessing}
            >
              Save Changes
            </SmallButton>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="bg-muted">
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
                  No courts added yet.
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
