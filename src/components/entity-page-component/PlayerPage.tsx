import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import type { Player } from "@/types/player";

type Props = {
  player?: Player;
  player_id?: string;
};

export default function PlayerPage({ player, player_id }: Props) {
  const [fetchedPlayer, setFetchedPlayer] = useState<Player | null>(
    player ?? null
  );
  const [loading, setLoading] = useState<boolean>(!player && !!player_id);

  useEffect(() => {
    const fetchPlayer = async () => {
      if (!player_id || player) return;
      try {
        setLoading(true);
        setFetchedPlayer(null);
      } catch (err) {
        console.error(err);
        setFetchedPlayer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [player_id, player]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="flex gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!fetchedPlayer) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Player not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We couldn’t find any details for this player.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const p = fetchedPlayer;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col items-center text-center gap-2">
          <Avatar className="h-24 w-24">
            <AvatarImage src={p.profile_image_url} alt={p.full_name} />
            <AvatarFallback>{p.full_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <CardTitle>{p.full_name}</CardTitle>
          <div className="flex gap-2 flex-wrap justify-center">
            <Badge variant="secondary">{p.gender}</Badge>
            <Badge variant="outline">
              {p.jersey_name} #{p.jersey_number}
            </Badge>
            <Badge variant={p.is_ban ? "destructive" : "default"}>
              {p.is_ban ? "Banned" : "Active"}
            </Badge>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-3 pt-4">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Position</span>
            <span className="font-medium">{p.position.join(", ")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Height</span>
            <span className="font-medium">{p.height_in} in</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Weight</span>
            <span className="font-medium">{p.weight_kg} kg</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Games Played</span>
            <span className="font-medium">{p.total_games_played}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Points Scored</span>
            <span className="font-medium">{p.total_points_scored}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Assists</span>
            <span className="font-medium">{p.total_assists}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Rebounds</span>
            <span className="font-medium">{p.total_rebounds}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
