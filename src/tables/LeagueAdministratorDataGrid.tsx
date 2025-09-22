import { useMemo, useState } from "react";
import { DataGrid, DataGridContainer } from "@/components/ui/data-grid";
import { DataGridPagination } from "@/components/ui/data-grid-pagination";
import { DataGridTable } from "@/components/ui/data-grid-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  type ColumnDef,
  type ColumnOrderState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import type { LeagueAdministator } from "@/types/leagueAdmin";
import type { League } from "@/types/league";
import { useQuery } from "@tanstack/react-query";
import { getAllLeagueAdminsQueryOption } from "@/queries/leagueAdminQueryOption";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type IData = LeagueAdministator & { active_league: League | null };

export default function LeagueAdministratorDataGrid() {
  const { data, isLoading, isError } = useQuery(getAllLeagueAdminsQueryOption);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "organization_name", desc: false },
  ]);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);

  const handleOperationalChange = async (id: string, value: boolean) => {
    try {
    } catch (err) {
      console.error("Failed to update operational status", err);
    }
  };

  const columns = useMemo<ColumnDef<IData>[]>(
    () => [
      {
        accessorKey: "organization_name",
        header: "Organization",
      },
      {
        accessorKey: "organization_type",
        header: "Type",
      },
      {
        accessorKey: "organization_address",
        header: "Address",
      },
      {
        accessorKey: "account.email",
        header: "Email",
      },
      {
        accessorKey: "is_operational",
        header: "Operational",
        cell: ({ row }) => {
          const admin = row.original;

          return (
            <Switch
              defaultChecked={admin.is_operational}
              onCheckedChange={(checked) =>
                handleOperationalChange(admin.league_administrator_id, checked)
              }
            />
          );
        },
      },
      {
        accessorKey: "active_league",
        header: "Active League",
        cell: ({ row }) => {
          const admin = row.original;

          return (
            <span>
              {admin.active_league
                ? admin.active_league.league_title
                : "No active league"}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: {
      pagination,
      sorting,
      columnOrder,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-500 text-center">Failed to load data</div>;
  }

  return (
    <DataGrid
      table={table}
      recordCount={data?.length ?? 0}
      tableLayout={{
        cellBorder: true,
      }}
    >
      <div className="w-full space-y-2.5">
        <DataGridContainer>
          <ScrollArea>
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </DataGridContainer>
        <DataGridPagination />
      </div>
    </DataGrid>
  );
}
