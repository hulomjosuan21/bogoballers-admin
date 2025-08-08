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
import { RoundFormatEnum, RoundStateEnum, RoundTypeEnum } from "@/enums/enums";
import { useState } from "react";

const defaultFormat = Object.values(RoundFormatEnum)[0];

export function RoundNodeDialog({
  round,
  status,
  setStatus,
  open,
  onOpenChange,
}: {
  round: { label: RoundTypeEnum } | null;
  status: RoundStateEnum;
  setStatus: (label: RoundTypeEnum, status: RoundStateEnum) => void;
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

        <div>
          <Select
            value={status}
            onValueChange={(value) =>
              setStatus(round.label, value as RoundStateEnum)
            }
          >
            <SelectTrigger className="mt-2 p-1 text-xs w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(RoundStateEnum).map((s) => (
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
