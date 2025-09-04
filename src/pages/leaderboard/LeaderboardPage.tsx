import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlayerLeaderboard from "./player/PlayerLeaderboard";
import { HeroHeader } from "../public/landing-page/header";

export default function LeaderboardPage() {
  return (
    <>
      <HeroHeader />
      <div className="">
        <div className="mt-12 p-2">
          <div className="p-2 w-full">
            <span className="font-semibold text-center">Leaderboard</span>
          </div>

          <Tabs defaultValue="player">
            <ScrollArea>
              <TabsList className="text-foreground mb-3 h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1 w-full justify-start">
                <TabsTrigger value="player" className="tab-trigger">
                  Player
                </TabsTrigger>
                <TabsTrigger value="team" className="tab-trigger">
                  Team
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <TabsContent value="player">
              <PlayerLeaderboard />
            </TabsContent>
            <TabsContent value="team"></TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
