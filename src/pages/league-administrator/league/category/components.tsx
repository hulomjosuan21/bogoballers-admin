import { getActiveLeagueQueryOption } from "@/queries/league";
import {
  Button,
  Input,
  Label,
  LeagueCategoryService,
  NoteBox,
  RoundStateEnum,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Settings2,
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  toast,
  useErrorToast,
  useQuery,
  useState,
  type CategoryNodeData,
  type RoundNodeData,
} from "./imports";
import { getActiveLeagueCategoriesQueryOption } from "@/queries/league-category";
import { useEffect, useRef, useTransition } from "react";
import { FolderCog, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { LeagueCategoryUpdatableFields } from "./types";
import { LeagueCategoryRoundService } from "./service";

export function LeagueCategoryNodeSheet({
  data,
  disable,
}: {
  data: CategoryNodeData;
  disable: boolean;
}) {
  const { category } = data;
  const { data: activeLeague } = useQuery(getActiveLeagueQueryOption);
  const handleError = useErrorToast();

  const { refetch: refetchCategories } = useQuery(
    getActiveLeagueCategoriesQueryOption(activeLeague?.league_id)
  );

  const [isPending, startTransition] = useTransition();

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

    startTransition(async () => {
      try {
        console.log(JSON.stringify(changes, null, 2));
        const response = await LeagueCategoryService.updateLeagueCategory({
          league_category_id: category.league_category_id,
          changes: changes,
        });
        await refetchCategories();
        toast.success(response.message);
      } catch (e) {
        handleError(e);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await LeagueCategoryService.deleteCategory(category.league_category_id);
        await refetchCategories();
        toast.success("Category deleted successfully");
      } catch (e) {
        handleError(e);
      }
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
            variant="destructive"
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
};

export function RoundNodeSheet({
  data,
  disable,
}: {
  data: RoundNodeData;
  disable: boolean;
}) {
  const { round } = data;
  const handleError = useErrorToast();
  const { data: activeLeague } = useQuery(getActiveLeagueQueryOption);
  const { refetch: refetchCategories } = useQuery(
    getActiveLeagueCategoriesQueryOption(activeLeague?.league_id)
  );

  const [isPending, startTransition] = useTransition();

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

    startTransition(async () => {
      try {
        const response = await LeagueCategoryRoundService.updateRound({
          roundId: round.round_id,
          changes: { round_status: status },
        });
        await refetchCategories();
        toast.success(response.message);
      } catch (e) {
        handleError(e);
      }
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
