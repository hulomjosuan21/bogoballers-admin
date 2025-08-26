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
import {
  Check,
  CheckIcon,
  ChevronsUpDown,
  Mars,
  MoreVertical,
  NonBinary,
  Venus,
  X,
} from "lucide-react";

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
import type { Category, CreateCategory } from "./category/types";
import { useQueries } from "@tanstack/react-query";
import { useErrorToast } from "@/components/error-toast";
import CategoryService from "@/service/category-service";
import {
  authLeagueAdminQueryOption,
  leagueAdminCategoriesQueryOption,
} from "@/queries/league-admin";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { StaticData } from "@/data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function ManageCategories() {
  const [categories, leagueAdmin] = useQueries({
    queries: [leagueAdminCategoriesQueryOption, authLeagueAdminQueryOption],
  });

  const handleError = useErrorToast();
  const [isProcessing, setProcess] = useState(false);
  const originalData = useRef<Category[]>(categories.data || []);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [open, setOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateCategory>({
    category_name: "",
    check_player_age: true,
    player_min_age: null,
    player_max_age: null,
    player_gender: "Male",
    check_address: true,
    allowed_address: null,
    allow_guest_team: false,
    team_entrance_fee_amount: 0,
    allow_guest_player: false,
    guest_player_fee_amount: 0,
  });

  useEffect(() => {
    if (categories.data) {
      originalData.current = categories.data;
    }
  }, [categories.data]);

  const handleChange = (
    key: keyof CreateCategory,
    value: string | boolean | number | null
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.category_name.trim()) {
      toast.error("Please enter a category name.");
      return;
    }

    if (form.check_player_age && form.player_min_age && form.player_max_age) {
      if (form.player_min_age >= form.player_max_age) {
        toast.error("Minimum age must be less than maximum age.");
        return;
      }
    }

    setProcess(true);
    try {
      if (editCategoryId) {
        await CategoryService.update(editCategoryId, form);
        toast.success("Category updated successfully");
      } else {
        const leagueAdminId = leagueAdmin.data?.league_administrator_id;
        if (!leagueAdminId) {
          throw new Error("No League Administrator ID found");
        }
        await CategoryService.create(leagueAdminId, form);
        toast.success("Category created successfully");
      }

      categories.refetch();

      setForm({
        category_name: "",
        check_player_age: true,
        player_min_age: null,
        player_max_age: null,
        check_address: true,
        allowed_address: null,
        allow_guest_team: false,
        team_entrance_fee_amount: 0,
        allow_guest_player: false,
        guest_player_fee_amount: 0,
        player_gender: "Male",
      });
      setEditCategoryId(null);
      setOpen(false);
    } catch (e) {
      handleError(e);
    } finally {
      setProcess(false);
    }
  };

  const handleEdit = (category: Category) => {
    setForm({
      category_name: category.category_name,
      check_player_age: category.check_player_age,
      player_min_age: category.player_min_age,
      player_max_age: category.player_max_age,
      check_address: category.check_address,
      allowed_address: category.allowed_address,
      allow_guest_team: category.allow_guest_team,
      team_entrance_fee_amount: category.team_entrance_fee_amount,
      allow_guest_player: category.allow_guest_player,
      guest_player_fee_amount: category.guest_player_fee_amount,
      player_gender: category.player_gender || "Male",
    });
    setEditCategoryId(category.category_id);
    setOpen(true);
  };

  const handleRemove = async (categoryId: string) => {
    setProcess(true);
    try {
      await CategoryService.delete(categoryId);
      toast.success("Category deleted successfully");
      categories.refetch();
    } catch (e) {
      handleError(e);
    } finally {
      setProcess(false);
    }
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "category_name",
      header: () => (
        <span className="block text-left text-xs font-medium">
          Category Name
        </span>
      ),
      cell: ({ row }) => (
        <div className="text-left text-sm font-medium">
          {row.getValue("category_name")}
        </div>
      ),
    },

    {
      accessorKey: "check_player_age",
      header: () => (
        <span className="block text-left text-xs font-medium">Age Check</span>
      ),
      cell: ({ row }) => (
        <div className="text-left text-sm">
          {row.original.check_player_age ? (
            <Badge variant="outline" className="gap-1">
              <CheckIcon
                className="text-emerald-500"
                size={12}
                aria-hidden="true"
              />
              Yes
            </Badge>
          ) : (
            <X className="text-red-500" size={12} aria-hidden="true" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "player_age_range",
      header: () => (
        <span className="block text-left text-xs font-medium">Age Range</span>
      ),
      cell: ({ row }) => {
        const category = row.original;
        if (!category.check_player_age) {
          return (
            <span className="block text-left text-sm text-muted-foreground">
              -
            </span>
          );
        }
        const min = category.player_min_age;
        const max = category.player_max_age;

        return (
          <span className="block text-left text-sm text-muted-foreground">
            {(min == null || min === 0) && (max == null || max === 0)
              ? "Not Set"
              : `${min} - ${max}`}
          </span>
        );
      },
    },
    {
      accessorKey: "check_address",
      header: () => (
        <span className="block text-left text-xs font-medium">
          Address Check
        </span>
      ),
      cell: ({ row }) => (
        <div className="text-left text-sm">
          {row.original.check_address ? (
            <Badge variant="outline" className="gap-1">
              <CheckIcon
                className="text-emerald-500"
                size={12}
                aria-hidden="true"
              />
              Yes
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <X className="text-red-500" size={12} aria-hidden="true" />
              No
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "player_gender",
      header: () => (
        <span className="block text-left text-xs font-medium">Gender</span>
      ),
      cell: ({ row }) => {
        const gender = row.original.player_gender;
        let Icon;
        if (gender == "Male") {
          Icon = Mars;
        } else if (gender == "Female") {
          Icon = Venus;
        } else {
          Icon = NonBinary;
        }

        return (
          <span className="flex items-center gap-1 text-sm">
            <Icon className="w-4 h-4 text-primary" />
            {gender || "Not Set"}
          </span>
        );
      },
    },
    {
      accessorKey: "allowed_address",
      header: () => (
        <span className="block text-left text-xs font-medium">Address</span>
      ),
      cell: ({ row }) => {
        const checkAddress = row.original.check_address;
        const address = row.original.allowed_address;

        return (
          <div
            className={`text-left text-xs ${
              checkAddress ? "" : "text-muted-foreground"
            }`}
          >
            {checkAddress ? address : "-"}
          </div>
        );
      },
    },

    {
      accessorKey: "team_entrance_fee_amount",
      header: () => (
        <span className="block text-left text-xs font-medium">Team Fee</span>
      ),
      cell: ({ row }) => (
        <div className="text-left text-sm font-mono">
          ₱{row.original.team_entrance_fee_amount.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "allow_guest_team",
      header: () => (
        <span className="block text-left text-xs font-medium">
          Guest Teams Allowed
        </span>
      ),
      cell: ({ row }) => (
        <div className="text-left text-sm">
          {row.original.allow_guest_team ? (
            <Badge variant="outline" className="gap-1">
              <CheckIcon
                className="text-emerald-500"
                size={12}
                aria-hidden="true"
              />
              Yes
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <X className="text-red-500" size={12} aria-hidden="true" />
              No
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "allow_guest_player",
      header: () => (
        <span className="block text-left text-xs font-medium">
          Guest Player Allowed
        </span>
      ),
      cell: ({ row }) => {
        const value = row.original.allow_guest_player;

        return (
          <span className="block text-left text-sm text-muted-foreground">
            {value ? (
              <Badge variant="outline" className="gap-1">
                <CheckIcon
                  className="text-emerald-500"
                  size={12}
                  aria-hidden="true"
                />
                Yes
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <X className="text-red-500" size={12} aria-hidden="true" />
                No
              </Badge>
            )}
          </span>
        );
      },
    },
    {
      accessorKey: "guest_player_fee_amount",
      header: () => (
        <span className="block text-center text-xs font-medium">Guest Fee</span>
      ),
      cell: ({ row }) => (
        <div className="text-center text-sm font-mono">
          {row.original.allow_guest_player ? (
            `₱${row.original.guest_player_fee_amount.toLocaleString()}`
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const category = row.original;
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
                <DropdownMenuItem onClick={() => handleEdit(category)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleRemove(category.category_id)}
                >
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
    data: categories.data ?? [],
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

  if (categories.isLoading || leagueAdmin.isLoading) {
    return (
      <p className="text-muted-foreground pt-1 text-center text-xs">
        Loading...
      </p>
    );
  }

  return (
    <section className="space-y-2">
      <div className="flex justify-between items-center gap-4">
        <p className="text-helper">
          Configure competition categories with age restrictions, fees, and
          guest policies.
        </p>

        <Dialog
          open={open}
          onOpenChange={(val) => {
            if (!val) {
              setEditCategoryId(null);
              setForm({
                category_name: "",
                check_player_age: true,
                player_min_age: null,
                player_max_age: null,
                player_gender: "Male",
                check_address: true,
                allowed_address: null,
                allow_guest_team: false,
                team_entrance_fee_amount: 0,
                allow_guest_player: false,
                guest_player_fee_amount: 0,
              });
            }
            setOpen(val);
          }}
        >
          <DialogTrigger asChild>
            <Button size={"sm"}>Add Category</Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-md max-h-[90vh] overflow-y-auto"
            aria-describedby={undefined}
          >
            <DialogHeader>
              <DialogTitle>
                {editCategoryId ? "Edit" : "Add"} Category
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Category Name</Label>
                <Input
                  defaultValue={form.category_name}
                  onChange={(e) =>
                    handleChange("category_name", e.target.value)
                  }
                  placeholder="e.g., Open League Men, Under-18 Girls"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="check_player_age"
                    checked={form.check_player_age}
                    onCheckedChange={(val) =>
                      handleChange("check_player_age", val)
                    }
                  />
                  <Label htmlFor="check_player_age">Check Player Age</Label>
                </div>

                {form.check_player_age && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-2">
                      <Label>Min Age</Label>
                      <Input
                        type="number"
                        defaultValue={form.player_min_age || ""}
                        onChange={(e) =>
                          handleChange(
                            "player_min_age",
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        placeholder="Min"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Max Age</Label>
                      <Input
                        type="number"
                        defaultValue={form.player_max_age || ""}
                        onChange={(e) =>
                          handleChange(
                            "player_max_age",
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        placeholder="Max"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Gender</Label>
                <RadioGroup
                  value={form.player_gender}
                  onValueChange={(val) => handleChange("player_gender", val)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Any" id="any" />
                    <Label htmlFor="any">Any</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="check_address"
                    checked={form.check_address}
                    onCheckedChange={(val) =>
                      handleChange("check_address", val)
                    }
                  />
                  <Label htmlFor="check_address">Check Address</Label>
                </div>

                {form.check_address && (
                  <div className="grid gap-2">
                    <Label>Allowed Address</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          id="allowed_address"
                          className={cn(
                            "justify-between",
                            !form.allowed_address && "text-muted-foreground"
                          )}
                        >
                          {form.allowed_address || "Select Address"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search address..." />
                          <CommandList>
                            <CommandEmpty>No address found.</CommandEmpty>
                            <CommandGroup>
                              {StaticData.Barangays.map((address) => (
                                <CommandItem
                                  key={address}
                                  value={address}
                                  onSelect={() =>
                                    handleChange("allowed_address", address)
                                  }
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      address === form.allowed_address
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {address}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <p className="text-helper">
                      Default address allowed for this category.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Team Entrance Fee</Label>
                <Input
                  type="number"
                  defaultValue={form.team_entrance_fee_amount}
                  onChange={(e) =>
                    handleChange(
                      "team_entrance_fee_amount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow_guest_team"
                    checked={form.allow_guest_team}
                    onCheckedChange={(val) =>
                      handleChange("allow_guest_team", val)
                    }
                  />
                  <Label htmlFor="allow_guest_team">Allow Guest Teams</Label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow_guest_player"
                    checked={form.allow_guest_player}
                    onCheckedChange={(val) =>
                      handleChange("allow_guest_player", val)
                    }
                  />
                  <Label htmlFor="allow_guest_player">
                    Allow Guest Players
                  </Label>
                </div>

                {form.allow_guest_player && (
                  <div className="grid gap-2">
                    <Label>Guest Player Fee</Label>
                    <Input
                      type="number"
                      defaultValue={form.guest_player_fee_amount}
                      onChange={(e) =>
                        handleChange(
                          "guest_player_fee_amount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full"
                size={"sm"}
              >
                {isProcessing
                  ? "Processing..."
                  : editCategoryId
                  ? "Update"
                  : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                  No categories added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination showPageSize={false} table={table} />
    </section>
  );
}
