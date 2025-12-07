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
import { Suspense, useMemo, useState } from "react";
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
  ExternalLink,
  FileText,
  MoreVertical,
  PersonStanding,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import type { PlayerTeam } from "@/types/player";
import { Spinner } from "../ui/spinner";
import { useNavigate } from "react-router-dom";
import axiosClient from "@/lib/axiosClient";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

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
        <SheetBody className="px-4 py-2 flex flex-col">
          <Suspense
            key={`team-${data?.team_id}`}
            fallback={
              <div className="h-40 grid place-content-center">
                <Spinner />
              </div>
            }
          >
            <LeagueTeamPlayerDataGrid players={data?.accepted_players ?? []} />
          </Suspense>
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
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const { mutate: banPlayer, isPending } = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosClient.delete(`/player-team/remove/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Player has been banned.");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to ban player.");
    },
  });
  const columns = useMemo<ColumnDef<PlayerTeam>[]>(
    () => [
      {
        accessorKey: "full_name",
        header: "Player",
        cell: ({ row }) => {
          const p = row.original;
          const isCaptain = row.original.is_team_captain;
          const documents = row.original.valid_documents;
          const openWindow = (url: string) => {
            window.open(
              url,
              "_blank",
              "width=1000,height=800,resizable=yes,scrollbars=yes"
            );
          };

          const linkPath = `/portal/league-administrator/start-chat/${row.original.user_id}/${row.original.full_name}`;

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
                  <DropdownMenuContent className="ml-2 w-56" align="end">
                    <DropdownMenuLabel>Action</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        navigate(linkPath);
                      }}
                    >
                      Chat
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        banPlayer(p.player_team_id);
                      }}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      {isPending ? "Banning..." : "Ban"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Documents</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {documents && documents.length > 0 ? (
                      documents.map((doc) => {
                        const urls = doc.document_urls;
                        const isMultiple =
                          Array.isArray(urls) && urls.length > 1;

                        if (isMultiple) {
                          return (
                            <DropdownMenuSub key={doc.doc_id}>
                              <DropdownMenuSubTrigger className="cursor-pointer">
                                <FileText className="mr-2 h-4 w-4" />
                                <span>{doc.document_type}</span>
                                <span className="ml-auto text-xs text-muted-foreground">
                                  {urls.length} pages
                                </span>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {urls.map((url, index) => (
                                  <DropdownMenuItem
                                    key={`${doc.doc_id}-${index}`}
                                    className="cursor-pointer"
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      openWindow(url);
                                    }}
                                  >
                                    <span>View Doc #{index + 1}</span>
                                    <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          );
                        } else {
                          const singleUrl = Array.isArray(urls)
                            ? urls[0]
                            : urls;
                          return (
                            <DropdownMenuItem
                              key={doc.doc_id}
                              className="cursor-pointer"
                              onSelect={(e) => {
                                e.preventDefault();
                                openWindow(singleUrl);
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              <span>{doc.document_type}</span>
                            </DropdownMenuItem>
                          );
                        }
                      })
                    ) : (
                      <DropdownMenuItem disabled>
                        No documents found
                      </DropdownMenuItem>
                    )}
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
      {
        accessorKey: "gender",
        header: "Gender",
        size: 60,
      },
      {
        accessorKey: "birth_date",
        header: "Age",
        accessorFn: (row) => {
          const birth = new Date(row.birth_date);
          const today = new Date();

          let age = today.getFullYear() - birth.getFullYear();
          const m = today.getMonth() - birth.getMonth();

          if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
          }
          return age;
        },
        size: 60,
      },
      { accessorKey: "jersey_name", header: "Jersey name", size: 80 },
      {
        accessorKey: "jersey_number",
        header: "Jersey #",
        cell: (info) => <span>{info.getValue() as number}</span>,
        size: 60,
      },
      {
        accessorKey: "position",
        header: "Position",
        cell: (info) => <span>{(info.getValue() as string[]).join(", ")}</span>,
        size: 150,
      },
      {
        accessorKey: "player_address",
        header: "Address",
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
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
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
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
          </Button>
          <Button
            size="sm"
            variant="outline"
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
