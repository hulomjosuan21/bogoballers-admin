import {
  RoundTypeEnum,
  RoundFormatEnum,
  RoundStateEnum,
} from "./category-types";
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

  const [selectedFormat, setSelectedFormat] =
    useState<RoundFormatEnum>(defaultFormat);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Round: {round.label}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Select
            value={selectedFormat}
            onValueChange={(value) =>
              setSelectedFormat(value as RoundFormatEnum)
            }
          >
            <SelectTrigger className="mt-2 p-1 text-xs w-full">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(RoundFormatEnum).map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
