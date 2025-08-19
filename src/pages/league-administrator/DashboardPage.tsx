import ContentHeader from "@/components/content-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImageZoom } from "@/components/ui/kibo-ui/image-zoom";
import {
  Status,
  StatusIndicator,
  StatusLabel,
} from "@/components/ui/kibo-ui/status";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { getActiveLeagueQueryOptions } from "@/queries/league";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { LeagueCategory } from "./league/category/types";
import type { League } from "@/types/league";

export default function DashboardPage() {
  const navigate = useNavigate();
  const activeLeague = useQuery(getActiveLeagueQueryOptions);

  const leagueStatus = (status: string) => {
    switch (status) {
      case "Scheduled":
        return (
          <Status status="maintenance">
            <StatusIndicator />
            <StatusLabel>Scheduled</StatusLabel>
          </Status>
        );
      case "Ongoing":
        return (
          <Status status="online">
            <StatusIndicator />
            <StatusLabel>Ongoing</StatusLabel>
          </Status>
        );
      case "Completed":
        return (
          <Status status="degraded">
            <StatusIndicator />
            <StatusLabel>Completed</StatusLabel>
          </Status>
        );
      case "Postponed":
        return (
          <Status status="offline">
            <StatusIndicator />
            <StatusLabel>Postponed</StatusLabel>
          </Status>
        );
      case "Cancelled":
        return (
          <Status status="offline">
            <StatusIndicator />
            <StatusLabel>Cancelled</StatusLabel>
          </Status>
        );
    }
  };

  const leagueSection = (league: League) => (
    <section>
      <div className="w-full">
        <div className="grid items-center gap-8 md:gap-16 lg:grid-cols-2">
          <ImageZoom>
            <img
              src={league.banner_url}
              alt={"activeleague-banner"}
              className="max-h-96 w-full rounded-md object-cover"
            />
          </ImageZoom>
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="flex items-center gap-2 my-2">
              <h1 className="mt-0 text-lg font-semibold text-balance">
                {league.league_title}
              </h1>
              {leagueStatus(league.status!)}
            </div>
            <p className="mb-8 max-w-xl text-muted-foreground">
              {league.league_description}
            </p>
            <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
              <Button variant="outline">Learn more</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const statisCards = (categories: LeagueCategory[]) => (
    <div className="flex items-center justify-center">
      <div className="grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="border-0">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              All Categories
            </CardTitle>
            <CardToolbar>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="-me-1.5">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="bottom">
                  <DropdownMenuLabel className="text-xs">
                    Categories
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {categories.map((cat, index) => (
                      <DropdownMenuItem key={index}>
                        {cat.category_name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(
                          "/league-administrator/pages/league/categories"
                        )
                      }
                    >
                      <Settings />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardToolbar>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl font-medium text-foreground tracking-tight">
                {categories.length ?? 0}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-2 border-t pt-2.5">
              Total categories in this league
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <ContentShell>
      <ContentHeader title="Dashboard" />
      <ContentBody>
        {activeLeague.data && (
          <>
            {leagueSection(activeLeague.data)}
            {statisCards(activeLeague.data.categories)}
          </>
        )}
      </ContentBody>
    </ContentShell>
  );
}
