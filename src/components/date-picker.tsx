import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import dayjs from "dayjs";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({
  date,
  setDate,
  disabled = false,
}: {
  date?: Date;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  disabled?: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? dayjs(date).format("MMMM D, YYYY") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      {!disabled && (
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            autoFocus
          />
        </PopoverContent>
      )}
    </Popover>
  );
}
