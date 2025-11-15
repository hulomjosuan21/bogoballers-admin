import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
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
import { useForm, Controller } from "react-hook-form";
import { useQueryClient, useMutation, useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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
import { Label } from "@/components/ui/label";
import { DataTablePagination } from "@/components/data-table-pagination";
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
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DatePicker } from "@/components/date-picker";
import MultipleSelector from "@/components/ui/multiselect";

import { useErrorToast } from "@/components/error-toast";
import CategoryService from "@/service/categoryService";
import {
  authLeagueAdminQueryOption,
  leagueAdminCategoriesQueryOption,
} from "@/queries/leagueAdminQueryOption";
import { StaticData } from "@/data";
import { cn } from "@/lib/utils";
import { useAlertDialog } from "@/hooks/userAlertDialog";
import type { Category, CreateCategory } from "@/types/category";
import type { BasicMultiSelectOption } from "@/components/ui/types";

const CategoryFormSheet = ({
  open,
  onOpenChange,
  editCategory,
  leagueAdminId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editCategory: Category | null;
  leagueAdminId?: string;
}) => {
  const queryClient = useQueryClient();
  const handleError = useErrorToast();
  const { openDialog } = useAlertDialog();

  const defaultValues: CreateCategory = {
    category_name: "",
    check_player_age: true,
    player_min_age: null,
    player_max_age: null,
    player_gender: "Male",
    check_address: false,
    allowed_address: null,
    allow_guest_team: false,
    team_entrance_fee_amount: 0,
    allow_guest_player: false,
    guest_player_fee_amount: 0,
    requires_valid_document: false,
    guest_team_fee_amount: 0,
    allowed_documents: null,
    document_valid_until: null,
  };

  const { control, register, handleSubmit, watch, reset, setValue } =
    useForm<CreateCategory>({
      defaultValues,
    });

  const values = watch();

  useMemo(() => {
    if (open) {
      if (editCategory) {
        reset({
          ...defaultValues,
          ...editCategory,
          allowed_documents: editCategory.allowed_documents || null,
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [open, editCategory, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateCategory) => {
      if (!leagueAdminId) throw new Error("Missing League ID");
      return CategoryService.create(leagueAdminId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: leagueAdminCategoriesQueryOption.queryKey,
      });
      toast.success("Category created successfully");
      onOpenChange(false);
    },
    onError: (error) => handleError(error),
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateCategory) =>
      CategoryService.update(editCategory!.category_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: leagueAdminCategoriesQueryOption.queryKey,
      });
      toast.success("Category updated successfully");
      onOpenChange(false);
    },
    onError: (error) => handleError(error),
  });

  const onSubmit = async (data: CreateCategory) => {
    const payload = { ...data };
    if (!payload.check_player_age) {
      payload.player_min_age = null;
      payload.player_max_age = null;
    }
    if (!payload.check_address) {
      payload.allowed_address = null;
    }
    if (!payload.allow_guest_player) {
      payload.guest_player_fee_amount = 0;
    }
    if (!payload.allow_guest_team) {
      payload.guest_team_fee_amount = 0;
    }
    if (!payload.requires_valid_document) {
      payload.allowed_documents = null;
      payload.document_valid_until = null;
    }

    if (editCategory) {
      const confirm = await openDialog({
        confirmText: "Edit",
        cancelText: "Cancel",
      });
      if (confirm) updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const documentOptions = useMemo(
    () => StaticData.PlayerValidationDocuments,
    []
  );
  const selectedDocs =
    (values.allowed_documents
      ?.map((d) => documentOptions.find((o) => o.value === d))
      .filter(Boolean) as BasicMultiSelectOption[]) || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="max-w-md">
        <SheetHeader>
          <SheetTitle>{editCategory ? "Edit" : "Add"} Category</SheetTitle>
        </SheetHeader>
        <SheetBody
          className="flex-1 overflow-y-auto space-y-4 px-1"
          aria-describedby={undefined}
        >
          <div className="grid gap-2">
            <Label>Category Name</Label>
            <Input
              {...register("category_name", { required: true })}
              placeholder="e.g., Open League"
            />
          </div>

          <div className="space-y-3 border-t pt-2">
            <div className="flex items-center space-x-2">
              <Controller
                control={control}
                name="check_player_age"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="c_age"
                  />
                )}
              />
              <Label htmlFor="c_age">Check Player Age</Label>
            </div>
            {values.check_player_age && (
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label>Min Age</Label>
                  <Input
                    type="number"
                    {...register("player_min_age", { valueAsNumber: true })}
                    placeholder="Min"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Max Age</Label>
                  <Input
                    type="number"
                    {...register("player_max_age", { valueAsNumber: true })}
                    placeholder="Max"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-2 border-t pt-2">
            <Label>Gender</Label>
            <Controller
              control={control}
              name="player_gender"
              render={({ field }) => (
                <RadioGroup
                  value={field.value || "Male"}
                  onValueChange={field.onChange}
                  className="flex space-x-4"
                >
                  {["Male", "Female", "Any"].map((g) => (
                    <div key={g} className="flex items-center space-x-2">
                      <RadioGroupItem value={g} id={g} />{" "}
                      <Label htmlFor={g}>{g}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </div>

          <div className="space-y-3 border-t pt-2">
            <div className="flex items-center space-x-2">
              <Controller
                control={control}
                name="check_address"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="c_addr"
                  />
                )}
              />
              <Label htmlFor="c_addr">Check Address</Label>
            </div>
            {values.check_address && (
              <div className="grid gap-2">
                <Label>Allowed Address</Label>
                <Controller
                  control={control}
                  name="allowed_address"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-between w-full",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value || "Select Address"}{" "}
                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search..." />
                          <CommandList>
                            <CommandEmpty>No address found.</CommandEmpty>
                            <CommandGroup>
                              {StaticData.Barangays.map((addr) => (
                                <CommandItem
                                  key={addr}
                                  value={addr}
                                  onSelect={() =>
                                    setValue("allowed_address", addr)
                                  }
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      addr === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {addr}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
            )}
          </div>

          <div className="space-y-3 border-t pt-2">
            <div className="grid gap-2">
              <Label>Team Entrance Fee</Label>
              <Input
                type="number"
                {...register("team_entrance_fee_amount", {
                  valueAsNumber: true,
                })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Controller
                control={control}
                name="allow_guest_team"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="c_gteam"
                  />
                )}
              />
              <Label htmlFor="c_gteam">Allow Guest Teams</Label>
            </div>
            {values.allow_guest_team && (
              <Input
                type="number"
                placeholder="Guest Team Fee"
                {...register("guest_team_fee_amount", { valueAsNumber: true })}
              />
            )}
            <div className="flex items-center space-x-2">
              <Controller
                control={control}
                name="allow_guest_player"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="c_gplay"
                  />
                )}
              />
              <Label htmlFor="c_gplay">Allow Guest Players</Label>
            </div>
            {values.allow_guest_player && (
              <Input
                type="number"
                placeholder="Guest Player Fee"
                {...register("guest_player_fee_amount", {
                  valueAsNumber: true,
                })}
              />
            )}
          </div>

          <div className="space-y-3 border-t pt-2">
            <div className="flex items-center space-x-2">
              <Controller
                control={control}
                name="requires_valid_document"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="c_docs"
                  />
                )}
              />
              <Label htmlFor="c_docs">Require Documents</Label>
            </div>
            {values.requires_valid_document && (
              <div className="space-y-3">
                <MultipleSelector
                  value={selectedDocs}
                  options={documentOptions}
                  placeholder="Select documents"
                  onChange={(opts) =>
                    setValue(
                      "allowed_documents",
                      opts.map((o) => o.value)
                    )
                  }
                />
                <Controller
                  control={control}
                  name="document_valid_until"
                  render={({ field }) => {
                    const currentDate = field.value
                      ? new Date(field.value)
                      : undefined;

                    const handleDateChange = (
                      newDateAction: React.SetStateAction<Date | undefined>
                    ) => {
                      let finalDate: Date | undefined;

                      if (typeof newDateAction === "function") {
                        finalDate = newDateAction(currentDate);
                      } else {
                        finalDate = newDateAction;
                      }

                      field.onChange(
                        finalDate ? finalDate.toISOString().split("T")[0] : null
                      );
                    };

                    return (
                      <DatePicker
                        date={currentDate}
                        setDate={handleDateChange}
                      />
                    );
                  }}
                />
              </div>
            )}
          </div>
        </SheetBody>
        <SheetFooter>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            size="sm"
            className="w-full"
          >
            {isPending
              ? "Processing..."
              : editCategory
              ? "Save Changes"
              : "Add"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default function ManageCategories() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [openSheet, setOpenSheet] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const queryClient = useQueryClient();
  const handleError = useErrorToast();
  const { openDialog } = useAlertDialog();

  const [categories, leagueAdmin] = useQueries({
    queries: [
      leagueAdminCategoriesQueryOption,
      authLeagueAdminQueryOption({ enabled: true }),
    ],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => CategoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: leagueAdminCategoriesQueryOption.queryKey,
      });
      toast.success("Category deleted");
    },
    onError: (error) => handleError(error),
  });

  const handleDelete = async (id: string) => {
    const confirm = await openDialog({
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (confirm) deleteMutation.mutate(id);
  };

  const handleEditClick = (cat: Category) => {
    setEditCategory(cat);
    setOpenSheet(true);
  };

  const handleAddClick = () => {
    setEditCategory(null);
    setOpenSheet(true);
  };

  const columns = useMemo<ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: "category_name",
        header: "Category Name",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("category_name")}</div>
        ),
      },
      {
        accessorKey: "player_age_range",
        header: "Age",
        cell: ({ row }) => {
          const { check_player_age, player_min_age, player_max_age } =
            row.original;
          if (!check_player_age)
            return (
              <Badge variant="outline" className="text-muted-foreground">
                <X size={12} /> No
              </Badge>
            );
          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline">
                    <CheckIcon className="text-emerald-500 mr-1" size={12} />{" "}
                    Yes
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {player_min_age} - {player_max_age} yrs
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
      },
      {
        accessorKey: "player_gender",
        header: "Gender",
        cell: ({ row }) => {
          const g = row.original.player_gender;
          const Icon = g === "Female" ? Venus : g === "Male" ? Mars : NonBinary;
          return (
            <div className="flex items-center gap-1">
              <Icon className="w-4 h-4 text-primary" /> {g}
            </div>
          );
        },
      },
      {
        accessorKey: "team_entrance_fee_amount",
        header: "Team Fee",
        cell: ({ row }) => (
          <span className="font-mono">
            ₱{row.original.team_entrance_fee_amount.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "allow_guest_team",
        header: "Guest Teams",
        cell: ({ row }) =>
          row.original.allow_guest_team ? (
            <CheckIcon className="text-emerald-500 w-4 h-4" />
          ) : (
            <X className="text-muted-foreground w-4 h-4" />
          ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditClick(row.original)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(row.original.category_id)}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: categories.data ?? [],
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  if (categories.isLoading || leagueAdmin.isLoading)
    return <p className="text-center text-xs pt-4">Loading...</p>;

  return (
    <section className="space-y-2">
      <div className="flex justify-between items-center gap-4">
        <p className="text-helper">Configure competition categories.</p>
        <Button size="sm" onClick={handleAddClick}>
          Add Category
        </Button>
      </div>
      <CategoryFormSheet
        open={openSheet}
        onOpenChange={setOpenSheet}
        editCategory={editCategory}
        leagueAdminId={leagueAdmin.data?.league_administrator_id}
      />

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
