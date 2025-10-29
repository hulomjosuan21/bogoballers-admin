import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCheckPlayerSheet } from "../../stores/leagueTeamStores";
import { NoteBox } from "../nodebox";
import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataGrid, DataGridContainer } from "@/components/ui/data-grid";
import { DataGridTable } from "@/components/ui/data-grid-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "../ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  PersonStanding,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import type { PlayerTeam } from "@/types/player";

export function LeagueTeamSheetSheetSubmissionSheet() {
  const { isOpen, data, dialogClose } = useCheckPlayerSheet();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && dialogClose()}>
      <SheetContent className="p-0" side={"bottom"}>
        <SheetHeader className="py-4 px-5 border-b border-border">
          <SheetTitle>Finalize Entry</SheetTitle>
          <SheetDescription>
            <div className="grid space-y-2.5">
              <div className="text-xs">
                <span className="font-semibold">Team name:</span>{" "}
                {data?.team_name}
              </div>
              <div className="text-xs">
                <span className="font-semibold">Address:</span>{" "}
                {data?.team_address}
              </div>
              <div>
                <NoteBox label="Note">
                  this action <strong>cannot be undone</strong>. Please review
                  all player information before finalizing.
                </NoteBox>
              </div>
            </div>
          </SheetDescription>
        </SheetHeader>
        <SheetBody className="max-h-[80vh] px-4 py-2 flex flex-col">
          <ScrollArea className="flex-1">
            <LeagueTeamPlayerDataGrid players={data?.accepted_players ?? []} />
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

export function LeagueTeamPlayerDataGrid({
  players,
}: {
  players: PlayerTeam[];
}) {
  const columns = useMemo<ColumnDef<PlayerTeam>[]>(
    () => [
      {
        accessorKey: "full_name",
        header: "Player",
        cell: ({ row }) => {
          const isCaptain = row.original.is_team_captain;
          const documents = row.original.valid_documents;

          return (
            <div className="flex items-center gap-2">
              <div className="text-left">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="ml-2" align="end">
                    <DropdownMenuLabel>Documents</DropdownMenuLabel>
                    {documents &&
                      documents.map((doc, i) => (
                        <DropdownMenuItem key={i} asChild>
                          <Link
                            to={doc}
                            target="_blank"
                            className="block max-w-[200px] truncate"
                          >
                            {doc.length > 20 ? doc.slice(0, 20) + "…" : doc}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Avatar className="size-8">
                <AvatarImage
                  src={row.original.profile_image_url}
                  alt={row.original.full_name}
                />
                <AvatarFallback>{row.original.full_name[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-px">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {row.original.full_name}
                  </span>
                  {isCaptain && (
                    <Badge variant="default" className="text-xs">
                      <PersonStanding className="h-4 w-4" /> Captain
                    </Badge>
                  )}
                </div>
                <div className="text-muted-foreground">
                  {row.original.user.email}
                </div>
              </div>
            </div>
          );
        },
        size: 250,
      },
      { accessorKey: "jersey_name", header: "Jersey name", size: 80 },
      {
        accessorKey: "jersey_number",
        header: "Jersey #",
        cell: (info) => <span>{info.getValue() as number}</span>,
        size: 80,
      },
      {
        accessorKey: "position",
        header: "Position",
        cell: (info) => <span>{(info.getValue() as string[]).join(", ")}</span>,
        size: 150,
      },
    ],
    []
  );

  const table = useReactTable({
    columns,
    data: players,
    getRowId: (row) => row.player_team_id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-2.5">
      <DataGrid
        table={table}
        recordCount={players.length}
        tableLayout={{ cellBorder: true }}
      >
        <DataGridContainer className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full min-h-0">
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </DataGridContainer>
      </DataGrid>

      <div className="flex items-center justify-start space-x-2">
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant={"outline"}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
          </Button>
          <Button
            size="sm"
            variant={"outline"}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
