import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLeaguePublic } from "@/hooks/useLeague";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { formatDate12h } from "@/lib/app_utils";
import { LeagueInfoComponent } from "./LeagueInfoComponent";

export default function PublicLeaguePage() {
  const navigate = useNavigate();
  const { publicLeagueId } = useParams<{ publicLeagueId: string }>();
  const {
    publicLeagueData: league,
    publicLeagueDataLoading,
    publicLeagueDataError,
  } = useLeaguePublic(publicLeagueId);

  const [isOpen, setIsOpen] = useState(false);

  if (publicLeagueDataLoading) {
    return <div className="p-6 text-center">Loading league...</div>;
  }

  if (publicLeagueDataError || !league) {
    return (
      <div className="p-6 text-center text-destructive">League not found</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-2">
      <Button variant={"outline"} size={"sm"} onClick={() => navigate(-1)}>
        Back
      </Button>
      <Card className="w-full rounded-md">
        <div className="relative mb-2">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-t-md">
            <img
              src={league.banner_url}
              alt={`${league.league_title} banner`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-md">
            <Badge>{league.status}</Badge>
          </div>
        </div>

        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-bold">
            {league.league_title}
          </CardTitle>
          <p className="text-muted-foreground">{league.league_description}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-md overflow-hidden">
              <img
                src={league.creator.organization_logo_url}
                alt={league.creator.organization_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium">{league.creator.organization_name}</p>
              <p className="text-sm text-muted-foreground">
                {league.creator.organization_type}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold">Location</p>
              <p className="text-muted-foreground">{league.league_address}</p>
            </div>
            <div>
              <p className="font-semibold">Registration Deadline</p>
              <p className="text-muted-foreground">
                {new Date(league.registration_deadline).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="font-semibold">Opening Date</p>
              <p className="text-muted-foreground">
                {formatDate12h(league.opening_date)}
              </p>
            </div>
            <div>
              <p className="font-semibold">Season Year</p>
              <p className="text-muted-foreground">{league.season_year}</p>
            </div>
            <div>
              <p className="font-semibold">Schedule</p>
              <p className="text-muted-foreground">
                {league.league_schedule[0]} - {league.league_schedule[1]}
              </p>
            </div>
          </div>

          {league.sportsmanship_rules?.length > 0 && (
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="flex w-[350px] flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-4 px-4">
                <h4 className="text-sm font-semibold">Sportsmanship Rules</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <ChevronsUpDown />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <div className="rounded-md border px-4 py-2 font-mono text-sm">
                1. {league.sportsmanship_rules[0]}
              </div>
              <CollapsibleContent className="flex flex-col gap-2">
                {league.sportsmanship_rules.map((rule, i) => (
                  <div
                    key={i}
                    className="rounded-md border px-4 py-2 font-mono text-sm"
                  >
                    {i + 2}. {rule}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          <div className="border-t border-b py-2">
            <LeagueInfoComponent publicLeagueId={publicLeagueId} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {league.league_officials?.length > 0 && (
              <Card className="rounded-md h-fit">
                <CardHeader>
                  <CardTitle>League Officials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {league.league_officials.map((o, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md overflow-hidden">
                          <img
                            src={o.photo}
                            alt={o.full_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{o.full_name}</p>
                          <p className="text-sm">{o.role}</p>
                          <p className="text-xs text-muted-foreground">
                            {o.contact_info}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {league.league_referees?.length > 0 && (
              <Card className="rounded-md h-fit">
                <CardHeader>
                  <CardTitle>Referees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {league.league_referees.map((r, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md overflow-hidden">
                          <img
                            src={r.photo}
                            alt={r.full_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{r.full_name}</p>

                          <p className="text-xs text-muted-foreground">
                            {r.contact_info}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {league.league_affiliates?.length > 0 && (
              <Card className="rounded-md h-fit">
                <CardHeader>
                  <CardTitle>Sponsors & Partners</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {league.league_affiliates.map((a, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md overflow-hidden">
                          <img
                            src={a.image}
                            alt={a.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{a.name}</p>
                          <p className="text-sm">{a.value}</p>
                          <p className="text-xs text-muted-foreground">
                            {a.contact_info}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {league.league_courts?.length > 0 && (
              <Card className="rounded-md h-fit">
                <CardHeader>
                  <CardTitle>Courts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {league.league_courts.map((c, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <p className="font-medium">{c.name}</p>
                        <p className="text-sm">{c.location}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
