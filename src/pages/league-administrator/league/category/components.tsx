import {
  Button,
  ButtonLoading,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
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
  useState,
  type RoundNodeData,
} from "./imports";

export function RoundNodeSheet({
  data,
  disable,
}: {
  data: RoundNodeData;
  disable: boolean;
}) {
  const [status, setStatus] = useState<string>(data.round.round_status);

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
  // const [
  //   {
  //     data: activeLeague,
  //     refetch: refetchActiveLeague,
  //     isLoading: activeLeagueLoading,
  //     error: activeLeagueError,
  //   },
  // ] = useQueries({
  //   queries: [getActiveLeagueQueryOptions, authLeagueAdminQueryOptions],
  // });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Add League Category</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4"></div>

        <DialogFooter>
          <ButtonLoading className="w-full">Add Category</ButtonLoading>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
