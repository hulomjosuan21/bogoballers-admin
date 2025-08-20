import {
  Button,
  ButtonLoading,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  getActiveLeagueQueryOptions,
  Input,
  Label,
  LeagueService,
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
  StaticData,
  toast,
  useErrorToast,
  useQuery,
  useState,
  type CreateLeagueCategory,
  type RoundNodeData,
} from "./imports";

export function RoundNodeSheet({ data }: { data: RoundNodeData }) {
  const [status, setStatus] = useState<string>(data.round.round_status);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="settings"
        >
          <Settings2 className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side={"bottom"} aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>{data.round.round_name}</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <div className="grid space-y-2">
            <NoteBox>
              Status changes are tracked immediately. Format is only saved if
              this round has a Format node connected to its bottom handle.
            </NoteBox>

            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v)}>
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
            </div>
          </div>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button type="button">Save Changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCategoryDialog({
  open,
  onOpenChange,
}: AddCategoryDialogProps) {
  const { data: activeLeague, refetch } = useQuery(getActiveLeagueQueryOptions);
  const handleError = useErrorToast();
  const [isProcessing, setProcess] = useState(false);

  const [form, setForm] = useState<CreateLeagueCategory>({
    category_name: "",
    max_team: 0,
    accept_teams: false,
    team_entrance_fee_amount: 0,
    individual_player_entrance_fee_amount: 0,
  });

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!form.category_name) {
      toast.error("Category name is required");
      return false;
    }
    if (form.max_team <= 0) {
      toast.error("Max teams must be greater than 0");
      return false;
    }
    if (form.team_entrance_fee_amount < 0) {
      toast.error("Team entrance fee cannot be negative");
      return false;
    }
    if (form.individual_player_entrance_fee_amount < 0) {
      toast.error("Individual entrance fee cannot be negative");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setProcess(true);
    try {
      if (!activeLeague?.league_id) {
        throw new Error("No League Id");
      }
      const res = await LeagueService.createCategory({
        leagueId: activeLeague.league_id,
        data: form,
      });
      await refetch();
      toast.success(res.message);
    } catch (e) {
      handleError(e);
    } finally {
      setForm({
        category_name: "",
        max_team: 0,
        accept_teams: false,
        team_entrance_fee_amount: 0,
        individual_player_entrance_fee_amount: 0,
      });
      onOpenChange(false);
      setProcess(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Add League Category</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category_name">Category Name</Label>
            <Select
              value={form.category_name}
              onValueChange={(value) => handleChange("category_name", value)}
            >
              <SelectTrigger id="category_name">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {StaticData.ListOfCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_team">Max Teams</Label>
            <Input
              id="max_team"
              type="number"
              value={form.max_team}
              onChange={(e) =>
                handleChange("max_team", parseInt(e.target.value) || 0)
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.accept_teams}
              onCheckedChange={(checked) =>
                handleChange("accept_teams", !!checked)
              }
            />
            <Label htmlFor="accept_teams">Accept Teams</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="team_fee">Team Entrance Fee</Label>
            <Input
              id="team_fee"
              type="number"
              value={form.team_entrance_fee_amount}
              onChange={(e) =>
                handleChange(
                  "team_entrance_fee_amount",
                  parseFloat(e.target.value) || 0
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="individual_fee">Individual Entrance Fee</Label>
            <Input
              id="individual_fee"
              type="number"
              value={form.individual_player_entrance_fee_amount}
              onChange={(e) =>
                handleChange(
                  "individual_player_entrance_fee_amount",
                  parseFloat(e.target.value) || 0
                )
              }
            />
          </div>
        </div>

        <DialogFooter>
          <ButtonLoading
            onClick={handleSave}
            loading={isProcessing}
            className="w-full"
          >
            Add Category
          </ButtonLoading>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
