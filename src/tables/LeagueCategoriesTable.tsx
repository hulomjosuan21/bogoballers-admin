import { useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveLeagueCategories } from "@/hooks/useLeagueCategories";
import type { LeagueCategory } from "@/types/leagueCategoryTypes";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { LeagueCategoryService } from "@/service/leagueCategory";

export function LeagueCategoriesTable({
  activeLeagueId,
}: {
  activeLeagueId?: string;
}) {
  const {
    activeLeagueCategories,
    activeLeagueCategoriesLoading,
    activeLeagueCategoriesError,
    refetchActiveLeagueCategories,
  } = useActiveLeagueCategories(activeLeagueId);

  function handleRefresh(): void {
    const refresh = async () => {
      await refetchActiveLeagueCategories();
    };

    toast.promise(refresh(), {
      loading: "Loading...",
      success: "Done",
      error: (e) => getErrorMessage(e),
    });
  }

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const [changes, setChanges] = useState<
    Record<string, Partial<LeagueCategory>>
  >({});

  const handleFieldChange = (
    id: string,
    field: keyof LeagueCategory,
    value: any
  ) => {
    setChanges((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSaveChanges = async () => {
    if (Object.keys(changes).length === 0) {
      toast.info("No changes to save");
      return;
    }
    const payload = Object.entries(changes).map(([id, fields]) => ({
      league_category_id: id,
      ...fields,
    }));
    console.log("🚀 Save payload:", payload);
    try {
      const update = async () => {
        const response = await LeagueCategoryService.updateMany(payload);

        return response;
      };

      toast.promise(update, {
        loading: "Loading...",
        success: (res) => res.message,
        error: (e) => getErrorMessage(e),
      });

      refetchActiveLeagueCategories();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const columns: ColumnDef<LeagueCategory>[] = [
    {
      accessorKey: "category_name",
      header: "Category",
    },
    {
      accessorKey: "league_category_status",
      header: "Status",
      cell: ({ row }) => {
        const id = row.original.league_category_id;
        const current =
          changes[id]?.league_category_status ??
          row.original.league_category_status;

        return (
          <Select
            value={current}
            onValueChange={(val) =>
              handleFieldChange(id, "league_category_status", val)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Close">Close</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Ongoing">Ongoing</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: "accept_teams",
      header: "Accept teams",
      cell: ({ row }) => {
        const id = row.original.league_category_id;
        const current = changes[id]?.accept_teams ?? row.original.accept_teams;

        return (
          <Switch
            checked={current}
            onCheckedChange={(val) =>
              handleFieldChange(id, "accept_teams", val)
            }
          />
        );
      },
    },
    {
      accessorKey: "max_team",
      header: "Max team",
      cell: ({ row }) => {
        const id = row.original.league_category_id;
        const current = changes[id]?.max_team ?? row.original.max_team;

        return (
          <Input
            type="number"
            value={current}
            onChange={(e) =>
              handleFieldChange(id, "max_team", Number(e.target.value))
            }
            className="w-[120px]"
          />
        );
      },
    },
    {
      accessorKey: "manage_automatic",
      header: "Manage automatic",
      cell: ({ row }) => {
        const id = row.original.league_category_id;
        const current =
          changes[id]?.manage_automatic ?? row.original.manage_automatic;

        return (
          <Checkbox
            checked={current}
            onCheckedChange={(val) =>
              handleFieldChange(id, "manage_automatic", !!val)
            }
          />
        );
      },
    },
  ];

  const table = useReactTable({
    data: activeLeagueCategories ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  if (activeLeagueCategoriesError) {
    <div className="h-screen grid place-content-center">
      <p className="text-sm text-red-500">
        {activeLeagueCategoriesError.message ||
          "Error loading league categories"}
      </p>
    </div>;
  }

  return (
    <div className="space-y-2">
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
                  {activeLeagueCategoriesLoading
                    ? "Loading data..."
                    : "No data"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <DataTablePagination showPageSize={false} table={table} />
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          Refresh
        </Button>
        {Object.keys(changes).length > 0 && (
          <Button size="sm" variant={"ghost"} onClick={handleSaveChanges}>
            Save Changes
          </Button>
        )}
      </div>
    </div>
  );
}
