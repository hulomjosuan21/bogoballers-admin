import type { RoundDetails, RoundType } from "./category-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RoundNodeDialog({
  round,
  status,
  setStatus,
  open,
  onOpenChange,
}: {
  round: RoundDetails | null;
  status: string;
  setStatus: (label: RoundType, status: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!round) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Round: {round.label}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Format Select */}
          <Select
            defaultValue={status}
            onValueChange={(value) => setStatus(round.label, value)}
          >
            <SelectTrigger className="mt-2 p-1 text-xs w-full">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {round.formats.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            defaultValue={status}
            onValueChange={(value) => setStatus(round.label, value)}
          >
            <SelectTrigger className="mt-2 p-1 text-xs w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {round.states.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  );
}
