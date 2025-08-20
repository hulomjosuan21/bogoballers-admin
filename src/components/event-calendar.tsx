import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
} from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Event {
  id: string;
  title: string;
  date: string;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type EventCalendarProp = {
  initialEvents: Event[];
  isPublic?: boolean;
};

export default function EventCalendar({
  initialEvents,
  isPublic = false,
}: EventCalendarProp) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [viewMode, setViewMode] = useState<"month" | "agenda">("month");

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = [];

  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "prev" ? -1 : 1));
      return newDate;
    });
  };

  const formatDate = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;

  const getEventsForDate = (date: string) =>
    events.filter((event) => event.date === date);

  const handleDayClick = (day: number) => {
    setSelectedDate(formatDate(day));
    setIsDialogOpen(true);
  };

  const handleAddEvent = () => {
    if (isPublic) return; // 🚫 prevent add in public mode
    if (!eventTitle.trim() || !selectedDate) return;

    setEvents((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: eventTitle.trim(),
        date: selectedDate,
      },
    ]);

    setEventTitle("");
    setIsDialogOpen(false);
  };

  return (
    <div className="border rounded-sm overflow-hidden">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium">
            {MONTHS[month]} {year}
          </h2>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {viewMode === "month" ? (
                <CalendarIcon className="mr-2 h-4 w-4" />
              ) : (
                <List className="mr-2 h-4 w-4" />
              )}
              {viewMode === "month" ? "Month View" : "Agenda View"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setViewMode("month")}>
              <CalendarIcon className="mr-2 h-4 w-4" /> Month View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setViewMode("agenda")}>
              <List className="mr-2 h-4 w-4" /> Agenda View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {viewMode === "month" ? (
        <>
          <div className="grid grid-cols-7 border-b">
            {DAYS.map((day) => (
              <div key={day} className="text-center py-2 font-medium">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="h-24 border-r border-b last:border-r-0"
                  />
                );
              }

              const dateStr = formatDate(day);
              const dayEvents = getEventsForDate(dateStr);
              const isToday = dateStr === todayStr;

              return (
                <Dialog
                  key={`${month}-${day}`}
                  open={isDialogOpen && selectedDate === dateStr}
                  onOpenChange={setIsDialogOpen}
                >
                  <DialogTrigger asChild>
                    <div
                      onClick={() => handleDayClick(day)}
                      className="h-24 p-1 cursor-pointer border-r border-b last:border-b-0 last:border-r-0 flex flex-col"
                    >
                      <div
                        className={cn(
                          "text-sm font-medium mb-1",
                          isToday && "text-primary font-bold underline"
                        )}
                      >
                        {day}
                      </div>

                      <ScrollArea className="flex-1 overflow-y-auto">
                        <div className="flex flex-col space-y-1">
                          {dayEvents.map((event) => (
                            <div
                              key={event.id}
                              className="text-xs px-2 py-1 border rounded truncate"
                            >
                              {event.title}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </DialogTrigger>

                  <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                      <DialogTitle>
                        {isPublic ? "Events" : "Add Event"} – {MONTHS[month]}{" "}
                        {day}, {year}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      {dayEvents.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Existing Events:</h3>
                          <div className="space-y-2">
                            {dayEvents.map((event) => (
                              <div
                                key={event.id}
                                className="px-3 py-2 border rounded"
                              >
                                {event.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!isPublic && (
                        <div className="space-y-3">
                          <Label htmlFor="eventTitle">Event Name</Label>
                          <Input
                            id="eventTitle"
                            value={eventTitle}
                            onChange={(e) => setEventTitle(e.target.value)}
                            placeholder="Enter event name"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddEvent();
                            }}
                          />
                          <Button
                            onClick={handleAddEvent}
                            disabled={!eventTitle.trim()}
                            className="w-full"
                          >
                            Add Event
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </>
      ) : (
        <div className="p-4 space-y-4">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events scheduled</p>
          ) : (
            events
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((event) => (
                <div
                  key={event.id}
                  className="p-3 border rounded-md flex items-center justify-between"
                >
                  <span className="font-medium">{event.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {event.date}
                  </span>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}
