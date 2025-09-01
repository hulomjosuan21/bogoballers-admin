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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DataTablePagination } from "@/components/data-table-pagination";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type SetStateAction,
} from "react";
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
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAlertDialog } from "@/hooks/user-alert-dialog";
import type { BasicMultiSelectOption } from "@/components/ui/types";
import { DatePicker } from "@/components/date-picker";
import MultipleSelector from "@/components/ui/multiselect";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [originalFormData, setOriginalFormData] =
    useState<CreateCategory | null>(null);
  const [form, setForm] = useState<CreateCategory>({
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
    allowed_documents: null,
    document_valid_until: null,
  });

  const [selectedDocuments, setSelectedDocuments] = useState<
    BasicMultiSelectOption[]
  >([]);
  const [documentValidDate, setDocumentValidDate] = useState<
    Date | undefined
  >();

  const { openDialog, AlertDialogComponent } = useAlertDialog();

  const documentOptions = useMemo(
    () => StaticData.PlayerValidationDocuments,
    []
  );

  useEffect(() => {
    if (categories.data) {
      originalData.current = categories.data;
    }
  }, [categories.data]);

  const hasFormChanges = () => {
    if (!originalFormData || !editCategoryId) return false;

    return (
      form.category_name !== originalFormData.category_name ||
      form.check_player_age !== originalFormData.check_player_age ||
      form.player_min_age !== originalFormData.player_min_age ||
      form.player_max_age !== originalFormData.player_max_age ||
      form.player_gender !== originalFormData.player_gender ||
      form.check_address !== originalFormData.check_address ||
      form.allowed_address !== originalFormData.allowed_address ||
      form.allow_guest_team !== originalFormData.allow_guest_team ||
      form.team_entrance_fee_amount !==
        originalFormData.team_entrance_fee_amount ||
      form.allow_guest_player !== originalFormData.allow_guest_player ||
      form.guest_player_fee_amount !==
        originalFormData.guest_player_fee_amount ||
      form.requires_valid_document !==
        originalFormData.requires_valid_document ||
      JSON.stringify(form.allowed_documents) !==
        JSON.stringify(originalFormData.allowed_documents) ||
      form.document_valid_until !== originalFormData.document_valid_until
    );
  };

  const handleChange = (
    key: keyof CreateCategory,
    value: string | boolean | number | null
  ) => {
    setForm((prev) => {
      const newForm = { ...prev, [key]: value };

      if (key === "check_player_age" && !value) {
        newForm.player_min_age = null;
        newForm.player_max_age = null;
      }

      if (key === "check_address" && !value) {
        newForm.allowed_address = null;
      }

      if (key === "allow_guest_player" && !value) {
        newForm.guest_player_fee_amount = 0;
      }

      if (key === "requires_valid_document" && !value) {
        newForm.allowed_documents = null;
        newForm.document_valid_until = null;
        setSelectedDocuments([]);
        setDocumentValidDate(undefined);
      }

      return newForm;
    });
  };

  const handleDocumentsChange = (documents: BasicMultiSelectOption[]) => {
    setSelectedDocuments(documents);
    setForm((prev) => ({
      ...prev,
      allowed_documents: documents.map((doc) => doc.value),
    }));
  };

  const handleDateChange = (value: SetStateAction<Date | undefined>) => {
    const date = typeof value === "function" ? value(documentValidDate) : value;
    setDocumentValidDate(date);
    setForm((prev) => ({
      ...prev,
      document_valid_until: date ? date.toISOString().split("T")[0] : null,
    }));
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
      const payload: CreateCategory = {
        category_name: form.category_name,
        check_player_age: form.check_player_age,
        player_min_age: form.check_player_age ? form.player_min_age : null,
        player_max_age: form.check_player_age ? form.player_max_age : null,
        player_gender: form.player_gender,
        check_address: form.check_address,
        allowed_address: form.check_address ? form.allowed_address : null,
        allow_guest_team: form.allow_guest_team,
        team_entrance_fee_amount: form.team_entrance_fee_amount || 0,
        allow_guest_player: form.allow_guest_player,
        guest_player_fee_amount: form.allow_guest_player
          ? form.guest_player_fee_amount
          : 0,
        requires_valid_document: form.requires_valid_document,
        allowed_documents: form.requires_valid_document
          ? form.allowed_documents
          : null,
        document_valid_until: form.requires_valid_document
          ? form.document_valid_until
          : null,
      };

      if (editCategoryId) {
        const confirm = await openDialog({
          confirmText: "Edit",
          cancelText: "Cancel",
        });
        if (!confirm) return;
        console.log(payload.document_valid_until);

        await CategoryService.update(editCategoryId, payload);
        toast.success("Category updated successfully");
      } else {
        const leagueAdminId = leagueAdmin.data?.league_administrator_id;
        if (!leagueAdminId) {
          throw new Error("No League Administrator ID found");
        }

        await CategoryService.create(leagueAdminId, payload);
        toast.success("Category created successfully");
      }

      categories.refetch();
      resetForm();
      setOpen(false);
    } catch (e) {
      handleError(e);
    } finally {
      setProcess(false);
    }
  };

  const resetForm = () => {
    setForm({
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
      allowed_documents: null,
      document_valid_until: null,
    });
    setEditCategoryId(null);
    setOriginalFormData(null);
    setSelectedDocuments([]);
    setDocumentValidDate(undefined);
  };

  const handleEdit = (category: Category) => {
    const formData = {
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
      requires_valid_document: category.requires_valid_document || false,
      allowed_documents: category.allowed_documents,
      document_valid_until: category.document_valid_until,
    };

    setForm(formData);
    setOriginalFormData(formData);
    setEditCategoryId(category.category_id);

    if (category.allowed_documents) {
      const selectedDocs = category.allowed_documents
        .map((doc) => documentOptions.find((opt) => opt.value === doc))
        .filter(Boolean) as BasicMultiSelectOption[];
      setSelectedDocuments(selectedDocs);
    } else {
      setSelectedDocuments([]);
    }

    if (category.document_valid_until) {
      setDocumentValidDate(new Date(category.document_valid_until));
    } else {
      setDocumentValidDate(undefined);
    }

    setOpen(true);
  };

  const handleRemove = async (categoryId: string) => {
    setProcess(true);
    try {
      const confirm = await openDialog({
        confirmText: "Delete",
        cancelText: "Cancel",
      });
      if (!confirm) return;

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
      accessorKey: "player_age_range",
      header: () => (
        <span className="block text-left text-xs font-medium">Age Range</span>
      ),
      cell: ({ row }) => {
        const category = row.original;
        if (!category.check_player_age) {
          return (
            <Badge variant="outline" className="gap-1">
              <X className="text-red-500" size={12} aria-hidden="true" />
              No
            </Badge>
          );
        }

        const min = category.player_min_age;
        const max = category.player_max_age;

        if ((min == null || min === 0) && (max == null || max === 0)) {
          return (
            <Badge variant="outline" className="gap-1">
              <X className="text-red-500" size={12} aria-hidden="true" />
              Not Set
            </Badge>
          );
        }

        return (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-1">
                  <CheckIcon
                    className="text-emerald-500"
                    size={12}
                    aria-hidden="true"
                  />
                  Yes
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="px-2 py-1 text-xs">
                {min} - {max} yrs
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
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
          <div className="text-left text-sm">
            {checkAddress && address ? (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="gap-1">
                      <CheckIcon
                        className="text-emerald-500"
                        size={12}
                        aria-hidden="true"
                      />
                      Yes
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    {address}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Badge variant="outline" className="gap-1">
                <X className="text-red-500" size={12} aria-hidden="true" />
                No
              </Badge>
            )}
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
      accessorKey: "requires_valid_document",
      header: () => (
        <span className="block text-left text-xs font-medium">
          Document Required
        </span>
      ),
      cell: ({ row }) => (
        <div className="text-left text-sm">
          {row.original.requires_valid_document ? (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="gap-1">
                    <CheckIcon
                      className="text-emerald-500"
                      size={12}
                      aria-hidden="true"
                    />
                    Yes
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="py-3 max-w-xs">
                  <div className="space-y-2">
                    <p className="text-[13px] font-medium">
                      Valid Until: {row.original.document_valid_until}
                    </p>

                    <div>
                      <p className="text-[13px] font-medium mb-1">
                        Allowed Documents:
                      </p>
                      {row.original.allowed_documents &&
                      row.original.allowed_documents.length > 0 ? (
                        <ul className="list-disc list-inside space-y-0.5 text-xs text-muted-foreground">
                          {row.original.allowed_documents.map((doc, idx) => (
                            <li key={idx}>{doc}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No documents
                        </p>
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
      <AlertDialogComponent />
      <div className="flex justify-between items-center gap-4">
        <p className="text-helper">
          Configure competition categories with age restrictions, fees, and
          guest policies.
        </p>

        <Sheet
          open={open}
          onOpenChange={(val) => {
            if (!val) {
              resetForm();
            }
            setOpen(val);
          }}
        >
          <SheetTrigger asChild>
            <Button size="sm">Add Category</Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="max-w-md"
            aria-describedby={undefined}
          >
            <SheetHeader>
              <SheetTitle>
                {editCategoryId ? "Edit" : "Add"} Category
              </SheetTitle>
            </SheetHeader>

            <SheetBody className="flex-1 overflow-y-auto space-y-4">
              <div className="grid gap-2">
                <Label>Category Name</Label>
                <Input
                  value={form.category_name}
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
                        value={form.player_min_age || ""}
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
                        value={form.player_max_age || ""}
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
                  {["Male", "Female", "Any"].map((gender) => (
                    <div key={gender} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={gender}
                        id={gender.toLowerCase()}
                      />
                      <Label htmlFor={gender.toLowerCase()}>{gender}</Label>
                    </div>
                  ))}
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
                  value={form.team_entrance_fee_amount}
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
                      value={form.guest_player_fee_amount}
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

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requires_valid_document"
                    checked={form.requires_valid_document}
                    onCheckedChange={(val) =>
                      handleChange("requires_valid_document", val)
                    }
                  />
                  <Label htmlFor="requires_valid_document">
                    Require Valid Documents
                  </Label>
                </div>

                {form.requires_valid_document && (
                  <div className="space-y-3">
                    <div className="grid gap-2">
                      <Label>Allowed Documents</Label>
                      <MultipleSelector
                        commandProps={{
                          label: "Select documents",
                        }}
                        value={selectedDocuments}
                        options={documentOptions}
                        onChange={handleDocumentsChange}
                        placeholder="Select required documents"
                        hideClearAllButton
                        hidePlaceholderWhenSelected
                        emptyIndicator={
                          <p className="text-center text-sm">
                            No documents found
                          </p>
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Document Valid Until</Label>
                      <DatePicker
                        date={documentValidDate}
                        setDate={handleDateChange}
                        disabled={!form.requires_valid_document}
                      />
                      <p className="text-helper">
                        Set expiration date for document validity.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </SheetBody>

            <SheetFooter className="flex justify-end gap-2">
              <SheetClose asChild>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    isProcessing ||
                    (editCategoryId !== null && !hasFormChanges())
                  }
                  size="sm"
                  className="w-full"
                >
                  {isProcessing
                    ? "Processing..."
                    : editCategoryId
                    ? "Save Changes"
                    : "Add"}
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
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
