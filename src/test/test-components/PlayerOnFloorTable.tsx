import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PlayerBook } from "@/types/scorebook";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const mockPlayers: PlayerBook[] = [
  {
    player_id: "p1",
    player_team_id: "t1",
    league_player_id: "lp1",
    full_name: "Michael Jordan",
    jersey_name: "JORDAN",
    jersey_number: 23,
    total_score: 28,
    per_qtr_score: [{ "1qtr": 8 }, { "2qtr": 6 }, { "3qtr": 7 }, { "4qtr": 7 }],
    P: 2,
    T: 1,
    summary: {
      fg2: 10,
      fga2: 18,
      fg3: 2,
      fga3: 6,
      reb: 7,
      ast: 5,
      F: 3,
      TP: 28,
    },
  },
  {
    player_id: "p2",
    player_team_id: "t1",
    league_player_id: "lp2",
    full_name: "Scottie Pippen",
    jersey_name: "PIPPEN",
    jersey_number: 33,
    total_score: 19,
    per_qtr_score: [{ "1qtr": 5 }, { "2qtr": 4 }, { "3qtr": 6 }, { "4qtr": 4 }],
    P: 1,
    T: 0,
    summary: {
      fg2: 6,
      fga2: 12,
      fg3: 2,
      fga3: 5,
      reb: 9,
      ast: 6,
      F: 2,
      TP: 19,
    },
  },
  {
    player_id: "p3",
    player_team_id: "t2",
    league_player_id: null,
    full_name: "Magic Johnson",
    jersey_name: "MAGIC",
    jersey_number: 32,
    total_score: 15,
    per_qtr_score: [{ "1qtr": 4 }, { "2qtr": 3 }, { "3qtr": 2 }, { "4qtr": 6 }],
    P: 3,
    T: 2,
    summary: {
      fg2: 5,
      fga2: 10,
      fg3: 1,
      fga3: 3,
      reb: 5,
      ast: 11,
      F: 1,
      TP: 15,
    },
  },
];

type Props = {
  viewMode?: boolean;
};

export function PlayerOnTheFloorTable({ viewMode = false }: Props) {
  const columns: ColumnDef<PlayerBook>[] = [
    {
      accessorKey: "player",
      header: "Player",
      cell: ({ row }) => {
        const player = row.original;

        return (
          <div className="flex flex-col items-start gap-1">
            <span className="text-sm font-semibold">{player.full_name}</span>
            <span className="text-xs">
              {player.jersey_number} | {player.jersey_name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "score",
      header: "Score",
      cell: ({ row }) => {
        const player = row.original;

        return (
          <div className="flex-[0_0_auto] w-fit flex gap-1 items-center flex-nowrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size={"sm"}
                  variant={"dim"}
                  className="h-6 px-1 rounded-sm"
                  disabled={viewMode}
                >
                  <MoreVertical className="h-3 w-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel className="text-xs py-0">
                  Controls
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="group-sm">
                  <DropdownMenuItem className="menu-sm-d">
                    -fg2
                  </DropdownMenuItem>
                  <DropdownMenuItem className="menu-sm">+fg2</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="group-sm">
                  <DropdownMenuItem className="menu-sm-d">
                    -fga2
                  </DropdownMenuItem>
                  <DropdownMenuItem className="menu-sm">+fga2</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="group-sm">
                  <DropdownMenuItem className="menu-sm-d">
                    -fg3
                  </DropdownMenuItem>
                  <DropdownMenuItem className="menu-sm">+fg3</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="group-sm">
                  <DropdownMenuItem className="menu-sm-d">
                    -fga3
                  </DropdownMenuItem>
                  <DropdownMenuItem className="menu-sm">+fga3</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="group-sm">
                  <DropdownMenuItem className="menu-sm-d">-ft</DropdownMenuItem>
                  <DropdownMenuItem className="menu-sm">+fta</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="grid grid-cols-3 gap-1">
                  <DropdownMenuItem className="menu-sm-d">-1</DropdownMenuItem>
                  <DropdownMenuItem className="menu-sm-d">+2</DropdownMenuItem>
                  <DropdownMenuItem className="menu-sm-d">-3</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Input
              type="number"
              className="rounded-sm w-12 remove-spinner"
              variant={"sm"}
              readOnly={viewMode}
            />
            <Button
              size={"sm"}
              variant={"dashed"}
              className="h-6 px-1 rounded-sm"
              disabled={viewMode}
            >
              +1
            </Button>
            <Button
              size={"sm"}
              variant={"secondary"}
              className="h-6 px-1 rounded-sm"
            >
              +2
            </Button>
            <Button
              size={"sm"}
              className="h-6 px-1 rounded-sm"
              disabled={viewMode}
            >
              +3
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "personal-foul",
      header: "P",
      cell: () => (
        <div className="flex-[0_0_auto] w-fit">
          <Input
            type="number"
            className="rounded-sm w-12 remove-spinner"
            variant={"sm"}
            readOnly={viewMode}
          />
        </div>
      ),
    },
    {
      accessorKey: "technical-foul",
      header: "T",
      cell: () => (
        <div className="flex-[0_0_auto] w-fit">
          <Input
            type="number"
            className="rounded-sm w-12 remove-spinner"
            variant={"sm"}
            readOnly={viewMode}
          />
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: mockPlayers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows.slice(0, 5);

  return (
    <div className="">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted text-xs p-0">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="py-0 h-8">
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
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-1">
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
