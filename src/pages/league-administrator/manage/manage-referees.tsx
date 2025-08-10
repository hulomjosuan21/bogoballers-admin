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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { ImageUploadField } from "@/components/image-upload-field";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table-pagination";
import type { LeagueReferee } from "@/types/league";
import LeagueService from "@/service/league-service";
import { useQuery } from "@tanstack/react-query";
import { getActiveLeagueQueryOptions } from "@/queries/league";
import { useErrorToast } from "@/components/error-toast";
import { ButtonLoading } from "@/components/custom-buttons";

export type LeagueRefereeCreate = {
  full_name: string;
  contact_info: string;
  photo: File | string;
  is_available: boolean;
};

export default function ManageRefereesComponent({
  data,
}: {
  data: LeagueReferee[];
}) {
  const { data: activeLeague } = useQuery(getActiveLeagueQueryOptions);
  const handleError = useErrorToast();
  const [isProcessing, setProcess] = useState(false);
  const [referees, setReferees] = useState<LeagueRefereeCreate[]>(data);
  const originalData = useRef<LeagueReferee[] | LeagueRefereeCreate[]>(data);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [hasChanges, setChanges] = useState(false);
  const [form, setForm] = useState<LeagueRefereeCreate>({
    full_name: "",
    contact_info: "",
    photo: "",
    is_available: true,
  });

  const handleChange = (
    key: keyof LeagueRefereeCreate,
    value: string | File | null | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value ?? "",
    }));
  };

  const handleSubmit = () => {
    if (!form.full_name.trim() || !form.contact_info.trim() || !form.photo) {
      toast.error("Please complete all fields before submitting.");
      return;
    }

    if (editIndex !== null) {
      const updated = [...referees];
      updated[editIndex] = form;
      setReferees(updated);
    } else {
      setReferees((prev) => [...prev, form]);
    }

    setForm({
      full_name: "",
      contact_info: "",
      photo: "",
      is_available: true,
    });
    setEditIndex(null);
    setOpen(false);
  };

  const handleEdit = (index: number) => {
    setForm(referees[index]);
    setEditIndex(index);
    setOpen(true);
  };

  const handleRemove = (index: number) => {
    setReferees((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const isEqual =
      JSON.stringify(referees) === JSON.stringify(originalData.current);
    setChanges(!isEqual);
  }, [referees]);

  const handleSaveChanges = async () => {
    setProcess(true);
    try {
      const leagueId = activeLeague?.league_id;
      if (!leagueId) {
        throw new Error("No League id");
      }
      const response = await LeagueService.updateSingleLeagueResourceField(
        leagueId,
        "league_referees",
        referees
      );

      toast.success(response.message);
      originalData.current = referees;
      setChanges(false);
    } catch (e) {
      handleError(e);
    } finally {
      setProcess(false);
    }
  };

  const columns: ColumnDef<LeagueRefereeCreate>[] = [
    {
      accessorKey: "photo_url",
      header: "Photo",
      cell: ({ row }) => {
        const value = row.original.photo;
        const name = row.original.full_name;
        return (
          <Avatar className="rounded-sm">
            <AvatarImage
              className="object-cover"
              src={
                typeof value === "string" ? value : URL.createObjectURL(value)
              }
              alt={name}
            />
            <AvatarFallback>
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
    },
    {
      accessorKey: "contact_info",
      header: "Contact Info",
    },
    {
      accessorKey: "is_available",
      header: "Available",
      cell: ({ row }) => {
        return (
          <Switch
            checked={row.original.is_available}
            onCheckedChange={(val) => {
              setReferees((prev) => {
                const updated = [...prev];
                updated[row.index] = {
                  ...updated[row.index],
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
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(row.index)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRemove(row.index)}>
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: referees,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center gap-4">
        <p className="text-helper">
          Manage referees and their availability for games.
        </p>

        <div className="flex gap-2 items-center">
          <Dialog
            open={open}
            onOpenChange={(val) => {
              if (!val) {
                setEditIndex(null);
                setForm({
                  full_name: "",
                  contact_info: "",
                  photo: "",
                  is_available: true,
                });
              }
              setOpen(val);
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                {editIndex !== null ? "Edit Referee" : "Add Referee"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>
                  {editIndex !== null ? "Edit" : "Add"} Referee
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
                  {editIndex !== null ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {hasChanges && (
            <ButtonLoading
              size={"sm"}
              variant={"secondary"}
              onClick={handleSaveChanges}
              loading={isProcessing}
            >
              Save Changes
            </ButtonLoading>
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
            {table.getRowModel().rows.length > 0 ? (
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
                  No referees added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} showPageSize={false} />
    </div>
  );
}
