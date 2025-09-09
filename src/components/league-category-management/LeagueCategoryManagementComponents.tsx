import { useEffect, useRef, useState } from "react";
import { FolderCog, Settings2, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

import { useActiveLeague } from "@/hooks/useActiveLeague";
import { useLeagueCategories } from "@/hooks/useLeagueCategories";
import { toast } from "sonner";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NoteBox } from "@/components/nodebox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RoundStateEnum,
  type CategoryNodeData,
  type LeagueCategoryUpdatableFields,
  type RoundNodeData,
} from "@/types/leagueCategoryTypes";
import {
  LeagueCategoryRoundService,
  LeagueCategoryService,
} from "@/service/leagueCategoryManagementService";

export function LeagueCategoryNodeSheet({
  data,
  disable,
}: {
  data: CategoryNodeData;
  disable: boolean;
}) {
  const { category } = data;
  const { activeLeagueId } = useActiveLeague();
  const [isPending, setPending] = useState(false);
  const { refetchLeagueCategories } = useLeagueCategories(activeLeagueId);

  const [maxTeam, setMaxTeam] = useState<
    LeagueCategoryUpdatableFields["max_team"]
  >(category.max_team || 0);
  const [acceptTeam, setAcceptTeam] = useState<
    LeagueCategoryUpdatableFields["accept_teams"]
  >(category.accept_teams || false);

  const originalDataRef = useRef<LeagueCategoryUpdatableFields>({
    max_team: category.max_team || 0,
    accept_teams: category.accept_teams || false,
  });

  useEffect(() => {
    setMaxTeam(category.max_team || 0);
    setAcceptTeam(category.accept_teams || false);
    originalDataRef.current = {
      max_team: category.max_team || 0,
      accept_teams: category.accept_teams || false,
    };
  }, [category]);

  const hasChanges =
    maxTeam !== originalDataRef.current.max_team ||
    acceptTeam !== originalDataRef.current.accept_teams;

  const handleSave = () => {
    const changes: Partial<LeagueCategoryUpdatableFields> = {};

    if (maxTeam !== originalDataRef.current.max_team) {
      changes.max_team = maxTeam;
    }
    if (acceptTeam !== originalDataRef.current.accept_teams) {
      changes.accept_teams = acceptTeam;
    }

    if (Object.keys(changes).length === 0) {
      toast.info("No changes detected");
      return;
    }

    setPending(true);

    const updateCategory = async () => {
      try {
        await LeagueCategoryService.updateLeagueCategory({
          league_category_id: category.league_category_id,
          changes,
        });
        await refetchLeagueCategories();
      } finally {
        setPending(false);
      }
    };

    toast.promise(updateCategory(), {
      loading: "Updating league category...",
      success: "League category updated successfully!",
      error: "Failed to update league category",
    });
  };

  const handleDelete = () => {
    setPending(true);

    const deleteCategory = async () => {
      try {
        await LeagueCategoryService.deleteCategory(category.league_category_id);
        await refetchLeagueCategories();
      } finally {
        setPending(false);
      }
    };

    toast.promise(deleteCategory(), {
      loading: "Deleting league category...",
      success: "League category deleted successfully!",
      error: "Failed to delete league category",
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          aria-label="settings"
          variant="ghost"
          size="icon"
          disabled={disable}
        >
          <FolderCog className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>Category: {category.category_name}</SheetTitle>
        </SheetHeader>
        <SheetBody className="flex-1">
          <div className="grid gap-4">
            <div className="grid gap-1">
              <Label htmlFor="maxTeam">Max Team</Label>
              <Input
                id="maxTeam"
                type="number"
                value={maxTeam}
                onChange={(e) => setMaxTeam(Number(e.target.value))}
              />
              <p className="text-helper">
                Set the maximum number of teams allowed in this category.
              </p>
            </div>

            <div className="grid gap-1">
              <div className="flex items-center gap-2">
                <Switch
                  id="acceptTeam"
                  checked={acceptTeam}
                  onCheckedChange={setAcceptTeam}
                />
                <Label htmlFor="acceptTeam">Accept Teams</Label>
              </div>
              <p className="text-helper">
                When enabled, this category will start accepting team
                registrations.
              </p>
            </div>
          </div>
        </SheetBody>
        <SheetFooter className="flex justify-between">
          <Button
            variant="ghost"
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || isPending}
            size="sm"
          >
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export type LeagueCategoryRoundUpdatableFields = {
  round_status: string;
  format_config: Record<string, any> | null;
};

export function RoundNodeSheet({
  data,
  disable,
}: {
  data: RoundNodeData;
  disable: boolean;
}) {
  const { round } = data;

  const { activeLeagueId } = useActiveLeague();
  const { refetchLeagueCategories } = useLeagueCategories(activeLeagueId);

  const [isPending, setPending] = useState(false);

  const [status, setStatus] = useState(round.round_status);
  const originalStatus = useRef(round.round_status);

  useEffect(() => {
    setStatus(round.round_status);
    originalStatus.current = round.round_status;
  }, [round]);

  const hasChanges = status !== originalStatus.current;

  const handleSave = () => {
    if (!hasChanges) {
      toast.info("No changes detected");
      return;
    }

    setPending(true);

    const updateRound = async () => {
      try {
        const response = await LeagueCategoryRoundService.updateRound({
          roundId: round.round_id,
          changes: { round_status: status },
        });
        await refetchLeagueCategories();
        return response.message;
      } finally {
        setPending(false);
      }
    };

    toast.promise(updateRound(), {
      loading: "Updating round...",
      success: (message) => message,
      error: "Failed to update round",
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="settings"
          disabled={disable}
        >
          <Settings2 className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>Round: {round.round_name}</SheetTitle>
        </SheetHeader>
        <SheetBody className="flex-1">
          <div className="grid gap-4">
            <NoteBox>Status changes are tracked automatically.</NoteBox>
            <NoteBox>
              Changing to Ongoing will automatically generate matches base on
              format.
            </NoteBox>
            <NoteBox>
              Changing to Finished will automatically compute the results
            </NoteBox>

            {/* Status Select */}
            <div className="grid gap-1">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as RoundStateEnum)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RoundStateEnum.Upcoming}>
                    Upcoming
                  </SelectItem>
                  <SelectItem value={RoundStateEnum.Ongoing}>
                    Ongoing
                  </SelectItem>
                  <SelectItem value={RoundStateEnum.Finished}>
                    Finished
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-helper">
                Set the current status of this round.
              </p>
            </div>

            <NoteBox>Can only proceed to next round if Finished.</NoteBox>

            <Button disabled={round.round_status != "Finished"}>
              Proceed to next round
            </Button>
          </div>
        </SheetBody>
        <SheetFooter className="flex justify-end gap-2">
          <SheetClose asChild>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || isPending}
              size="sm"
              className="w-full"
            >
              Save Changes
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
