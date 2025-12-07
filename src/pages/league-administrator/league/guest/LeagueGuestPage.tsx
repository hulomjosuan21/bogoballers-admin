import { Suspense, useMemo } from "react";
import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { RefreshCcw } from "lucide-react";

// UI Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Layouts & Pagination
import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { DataTablePagination } from "@/components/data-table-pagination";

// Alerts
import {
  NoActiveLeagueAlert,
  PendingLeagueAlert,
} from "@/components/LeagueStatusAlert";

// Hooks
import { useLeagueCategoriesRoundsGroups } from "@/hooks/useLeagueCategoriesRoundsGroups";
import { useLeagueGuestOperations } from "@/hooks/useLeagueGuestOperations";
import useActiveLeagueMeta from "@/hooks/useActiveLeagueMeta";

// Types
import type { GuestRegistrationRequest } from "@/types/guest";
import type { Player } from "@/types/player";
import type { Team } from "@/types/team";
import { PlayerGuestActionCell } from "./guest-components/PlayerGuestActionCell";
import { TeamGuestActionCell } from "./guest-components/TeamGuestActionCell";

// --- Type Guards ---
function isPlayer(details: Player | Team): details is Player {
  return (details as Player).full_name !== undefined;
}

function isTeam(details: Player | Team): details is Team {
  return (details as Team).team_name !== undefined;
}

// --- Internal Table Component ---
function SimpleDataTable({
  data,
  columns,
  isLoading,
}: {
  data: GuestRegistrationRequest[];
  columns: ColumnDef<GuestRegistrationRequest>[];
  isLoading: boolean;
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex justify-center items-center gap-2 text-muted-foreground">
                    <Spinner /> Loading data...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
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
                  className="h-24 text-center text-muted-foreground"
                >
                  No guest requests found.
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

// --- MAIN PAGE ---
export default function LeagueGuestPage() {
  const { categories, selectedCategory, setSelectedCategory } =
    useLeagueCategoriesRoundsGroups();
  const { isActive, league_status, message } = useActiveLeagueMeta();

  // 1. Fetch Data
  const { requests, isLoading, refetch } =
    useLeagueGuestOperations(selectedCategory);

  // 2. Separate Data Streams
  const playerRequests = useMemo(
    () => requests.filter((r) => r.request_type === "Player"),
    [requests]
  );
  const teamRequests = useMemo(
    () => requests.filter((r) => r.request_type === "Team"),
    [requests]
  );

  // 3. Define Player Columns
  const playerColumns: ColumnDef<GuestRegistrationRequest>[] = useMemo(
    () => [
      {
        accessorKey: "details",
        header: "Player Name",
        cell: ({ row }) => {
          const details = row.original.details;
          return isPlayer(details) ? (
            <span className="font-medium">{details.full_name}</span>
          ) : (
            <span>Unknown</span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          const variant =
            status === "Accepted"
              ? "default"
              : status === "Rejected"
              ? "destructive"
              : "secondary";
          return <Badge variant={variant}>{status}</Badge>;
        },
      },
      {
        accessorKey: "payment_status",
        header: "Payment",
        cell: ({ row }) => {
          const status = row.original.payment_status;
          const variant = status.startsWith("Paid")
            ? "default"
            : status === "Pending"
            ? "outline"
            : "secondary";
          return <Badge variant={variant}>{status}</Badge>;
        },
      },
      {
        accessorKey: "amount_paid",
        header: "Amount",
        cell: ({ row }) => {
          const amount = row.original.amount_paid;
          return <span>{amount > 0 ? `₱${amount.toFixed(2)}` : "Free"}</span>;
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <PlayerGuestActionCell
            request={row.original}
            categoryId={selectedCategory}
          />
        ),
      },
    ],
    [selectedCategory]
  );

  // 4. Define Team Columns
  const teamColumns: ColumnDef<GuestRegistrationRequest>[] = useMemo(
    () => [
      {
        accessorKey: "details",
        header: "Team Name",
        cell: ({ row }) => {
          const details = row.original.details;
          return isTeam(details) ? (
            <div className="flex flex-col">
              <span className="font-medium">{details.team_name}</span>
              <span className="text-xs text-muted-foreground">
                {details.contact_number || "No Contact Person"}
              </span>
            </div>
          ) : (
            <span>Unknown</span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          const variant =
            status === "Accepted"
              ? "default"
              : status === "Rejected"
              ? "destructive"
              : "secondary";
          return <Badge variant={variant}>{status}</Badge>;
        },
      },
      {
        accessorKey: "payment_status",
        header: "Payment",
        cell: ({ row }) => {
          const status = row.original.payment_status;
          const variant = status.startsWith("Paid")
            ? "default"
            : status === "Pending"
            ? "outline"
            : "secondary";
          return <Badge variant={variant}>{status}</Badge>;
        },
      },
      {
        accessorKey: "amount_paid",
        header: "Amount",
        cell: ({ row }) => {
          const amount = row.original.amount_paid;
          return <span>{amount > 0 ? `₱${amount.toFixed(2)}` : "Free"}</span>;
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <TeamGuestActionCell
            request={row.original}
            categoryId={selectedCategory}
          />
        ),
      },
    ],
    [selectedCategory]
  );

  if (!isActive) {
    return (
      <NoActiveLeagueAlert message={message ?? "No active league found."} />
    );
  }

  if (league_status === "Pending") {
    return <PendingLeagueAlert />;
  }

  return (
    <ContentShell>
      <ContentHeader title="Manage League Guests">
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCcw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </ContentHeader>

      <ContentBody>
        <div className="flex flex-col gap-4">
          {/* Category Selector */}
          <div className="w-full sm:w-[250px]">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem
                    key={c.league_category_id}
                    value={c.league_category_id}
                  >
                    {c.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs
            defaultValue="players"
            className="text-sm text-muted-foreground"
          >
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="players">
                Guest Players ({playerRequests.length})
              </TabsTrigger>
              <TabsTrigger value="teams">
                Guest Teams ({teamRequests.length})
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <Suspense
                fallback={
                  <div className="h-40 grid place-content-center">
                    <Spinner />
                  </div>
                }
              >
                <TabsContent value="players">
                  <SimpleDataTable
                    columns={playerColumns}
                    data={playerRequests}
                    isLoading={isLoading}
                  />
                </TabsContent>

                <TabsContent value="teams">
                  <SimpleDataTable
                    columns={teamColumns}
                    data={teamRequests}
                    isLoading={isLoading}
                  />
                </TabsContent>
              </Suspense>
            </div>
          </Tabs>
        </div>
      </ContentBody>
    </ContentShell>
  );
}
