import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCheckPlayerSheet } from "../../stores/leagueTeamStores";
import { File } from "lucide-react";
import { calculateAge } from "@/helpers/helpers";
import { NoteBox } from "@/components/nodebox";

export function CheckPlayerSheet() {
  const { isOpen, data, dialogClose } = useCheckPlayerSheet();

  const players = data?.accepted_players;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && dialogClose()}>
      <SheetContent className="p-0" side={"right"}>
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
        <SheetBody className="py-0 grow overflow-hidden flex flex-col">
          <div className="space-y-2 mt-2 px-4 overflow-y-auto flex-1">
            {players?.length ? (
              players.map((playerTeam, index) => {
                const player = playerTeam;
                return (
                  <div key={index} className="p-3 border rounded-md">
                    <div className="flex items-center gap-4 mb-2">
                      {player.profile_image_url && (
                        <a
                          href={player.profile_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={player.profile_image_url}
                            alt={player.full_name}
                            className="h-8 w-8 rounded-sm object-cover cursor-pointer"
                          />
                        </a>
                      )}
                      <h3 className="text-md">{player.full_name}</h3>
                    </div>

                    <div className="grid space-y-2.5">
                      <div className="text-xs">
                        <span className="font-semibold">Gender:</span>{" "}
                        {player.gender}
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold">Birth Date:</span>{" "}
                        {player.birth_date}
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold">Age:</span>{" "}
                        {calculateAge(player.birth_date)}
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold">Address:</span>{" "}
                        {player.player_address}
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold">Jersey Name:</span>{" "}
                        {player.jersey_name}
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold">Jersey Number:</span>{" "}
                        {player.jersey_number}
                      </div>
                      {player.valid_documents.length > 0 && (
                        <div className="flex items-center gap-2">
                          {player.valid_documents.map((doc, i) => (
                            <a
                              href={doc}
                              target="_blank"
                              rel="noopener noreferrer"
                              key={i}
                            >
                              <File />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No players available</p>
            )}
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
