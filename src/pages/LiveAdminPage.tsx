import { useLiveAdmins } from "@/hooks/scorebook/useLiveAdmins";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const LiveAdminPage = () => {
  const { liveAdmins, latency } = useLiveAdmins();

  const latencyBadge = () => {
    return (
      <Badge variant="outline" className="gap-1.5 text-xs font-light">
        <span
          className={cn(
            "size-1.5 rounded-full",
            latency == null
              ? "bg-gray-400"
              : latency < 100
              ? "bg-emerald-500"
              : latency < 200
              ? "bg-orange-500"
              : "bg-red-500"
          )}
          aria-hidden="true"
        />
        {latency != null ? `${latency}ms` : "Disconnected"}
      </Badge>
    );
  };

  if (liveAdmins.length === 0) {
    return null;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-md font-bold">Live Matches</h1>
        {latencyBadge()}
      </div>
      <ul className="space-y-3">
        {liveAdmins.map((a) => (
          <li key={a.league_administrator_id}>
            <Card className="rounded-md">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    {a.home_team_name ?? "TBD"}{" "}
                    <span className="text-muted-foreground">vs</span>{" "}
                    {a.away_team_name ?? "TBD"}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {a.league_administrator}
                  </p>
                </div>
                <Link
                  to={`/view/live-match/match_room_${a.league_match_id}`}
                  target="_blank"
                >
                  <Button size="sm" variant="secondary">
                    View
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LiveAdminPage;
