import { useEffect, useState, useTransition, useMemo } from "react";
import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import {
  Info,
  Save,
  RotateCcw,
  CalendarIcon,
  Loader2,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
} from "@/components/ui/alert";
import { RiSpamFill } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LeagueService, leagueService } from "@/service/leagueService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { PDFViewer } from "@react-pdf/renderer";
import { toast } from "sonner";
import type { League } from "@/types/league";
import ActivityDesignDocument from "@/components/pdf/LeaguePdf"; // Ensure this matches your file path
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateTimePicker } from "@/components/datetime-picker";
import useActiveLeagueMeta from "@/hooks/useActiveLeagueMeta";
import { NoActiveLeagueAlert } from "@/components/LeagueStatusAlert";

export default function LeagueUpdatePage() {
  const { isActive, message, refetch } = useActiveLeagueMeta();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const { data: serverData, isLoading } = useQuery({
    queryKey: ["active-league-data"],
    queryFn: () => LeagueService.fetchActive(),
    staleTime: Infinity,
    enabled: isActive,
    refetchOnWindowFocus: false,
  });

  const [draft, setDraft] = useState<League | null>(null);
  const [pdfData, setPdfData] = useState<League | null>(null);
  useEffect(() => {
    if (serverData) {
      const clonedData = JSON.parse(JSON.stringify(serverData));
      setDraft(clonedData);
      setPdfData(clonedData);
    }
  }, [serverData]);
  useEffect(() => {
    if (draft) {
      startTransition(() => {
        setPdfData(draft);
      });
    }
  }, [draft]);
  const getDirtyFields = (
    original: League,
    current: League
  ): Partial<League> => {
    const changes: Partial<League> = {};
    (Object.keys(current) as Array<keyof League>).forEach((key) => {
      if (JSON.stringify(original[key]) !== JSON.stringify(current[key])) {
        // @ts-ignore - dynamic assignment
        changes[key] = current[key];
      }
    });
    return changes;
  };
  const isDirty = useMemo(() => {
    if (!serverData || !draft) return false;
    return JSON.stringify(serverData) !== JSON.stringify(draft);
  }, [serverData, draft]);
  const updateMutation = useMutation({
    mutationFn: (changes: Partial<League>) =>
      leagueService.updateLeague(serverData!.league_id, changes),
    onSuccess: async () => {
      toast.success("League details updated successfully!");

      if (serverData) {
        const resetData = JSON.parse(JSON.stringify(serverData));
        setDraft(resetData);
        setPdfData(resetData);
      }

      await Promise.all([
        refetch(),
        queryClient.invalidateQueries({ queryKey: ["active-league-data"] }),
      ]);
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to update league.");
    },
  });

  const handleSave = () => {
    if (!draft || !serverData) return;

    const changes = getDirtyFields(serverData, draft);

    if (Object.keys(changes).length === 0) {
      toast.info("No changes detected.");
      return;
    }

    console.log(JSON.stringify(changes, null, 2));
    updateMutation.mutate(changes);
  };
  const handleReset = () => {
    if (serverData) {
      const resetData = JSON.parse(JSON.stringify(serverData));
      setDraft(resetData);
      startTransition(() => setPdfData(resetData));
    }
  };
  const handleTextChange = (field: keyof League, value: string | number) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleArrayChange = (field: keyof League, rawValue: string) => {
    const lines = rawValue.split(/\r?\n/);
    const cleanedLines = lines.map((line) => line.replace(/\s+$/, ""));

    setDraft((prev) => (prev ? { ...prev, [field]: cleanedLines } : null));
  };

  const handleDateChange = (field: keyof League, date: Date | undefined) => {
    if (!date) return;
    setDraft((prev) =>
      prev ? { ...prev, [field]: date.toISOString() } : null
    );
  };

  const handleScheduleChange = (index: 0 | 1, date: Date | undefined) => {
    if (!date || !draft) return;
    const newSchedule = [...draft.league_schedule];
    newSchedule[index] = date.toISOString();
    setDraft({ ...draft, league_schedule: newSchedule as [string, string] });
  };

  const DateTimeField = ({
    label,
    dateIso,
    onChange,
  }: {
    label: string;
    dateIso: string;
    onChange: (d: Date | undefined) => void;
  }) => {
    const dateValue = dateIso ? new Date(dateIso) : undefined;

    return (
      <div className="flex flex-col space-y-2">
        <Label>{label}</Label>
        <DateTimePicker
          dateTime={dateValue}
          setDateTime={(update) => {
            const newDate =
              update instanceof Function ? update(dateValue) : update;
            onChange(newDate);
          }}
        />
      </div>
    );
  };

  const DatePickerField = ({
    label,
    dateIso,
    onChange,
  }: {
    label: string;
    dateIso: string;
    onChange: (d: Date | undefined) => void;
  }) => (
    <div className="flex flex-col space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full pl-3 text-left font-normal",
              !dateIso && "text-muted-foreground"
            )}
          >
            {dateIso ? (
              format(new Date(dateIso), "PPP")
            ) : (
              <span>Pick a date</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateIso ? new Date(dateIso) : undefined}
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  const hasData = !!serverData;
  if (!isActive) {
    return (
      <NoActiveLeagueAlert message={message ?? "No active league found."} />
    );
  }
  return (
    <ContentShell>
      <ContentHeader title="Update League Activity Design">
        <div className="flex items-center gap-2">
          <Button variant={"ghost"} size={"sm"}>
            <Info className="h-4 w-4" />
          </Button>
          {draft && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={updateMutation.isPending || !isDirty}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateMutation.isPending || !isDirty}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}

          {draft && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 min-w-40">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        draft.status === "Pending" && "bg-amber-500",
                        draft.status === "Scheduled" && "bg-indigo-500",
                        draft.status === "Ongoing" && "bg-green-500",
                        draft.status === "Completed" && "bg-teal-500",
                        draft.status === "Rejected" && "bg-red-500",
                        draft.status === "Postponed" && "bg-orange-500",
                        draft.status === "Cancelled" && "bg-gray-500"
                      )}
                    />
                    <span className="font-medium">
                      {draft.status || "Select Status"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                {[
                  { value: "Pending", label: "Pending", color: "bg-amber-500" },
                  {
                    value: "Scheduled",
                    label: "Scheduled",
                    color: "bg-indigo-500",
                  },
                  { value: "Ongoing", label: "Ongoing", color: "bg-green-500" },
                  {
                    value: "Completed",
                    label: "Completed",
                    color: "bg-teal-500",
                  },
                  { value: "Rejected", label: "Rejected", color: "bg-red-500" },
                  {
                    value: "Postponed",
                    label: "Postponed",
                    color: "bg-orange-500",
                  },
                  {
                    value: "Cancelled",
                    label: "Cancelled",
                    color: "bg-gray-500",
                  },
                ].map((status) => (
                  <DropdownMenuItem
                    key={status.value}
                    onClick={() => {
                      if (draft.status !== status.value) {
                        setDraft((prev) =>
                          prev
                            ? { ...prev, status: status.value as string }
                            : null
                        );
                        toast.success(`Status updated to ${status.label}`);
                      }
                    }}
                    className={cn(
                      "gap-2 cursor-pointer",
                      draft.status === status.value && "font-semibold"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full", status.color)} />
                    {status.label}
                    {draft.status === status.value && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </ContentHeader>

      <ContentBody className="p-0 overflow-hidden h-[calc(100vh-60px)]">
        {isLoading && (
          <div className="h-40 grid place-content-center">
            <Spinner />
          </div>
        )}

        {!hasData && !isLoading && (
          <div className="p-6">
            <Alert variant="info">
              <AlertIcon>
                <RiSpamFill />
              </AlertIcon>
              <AlertTitle>No Active League found.</AlertTitle>
              <AlertToolbar>
                <Button
                  variant="inverse"
                  size="sm"
                  onClick={() =>
                    navigate("/league-administrator/pages/league/new")
                  }
                >
                  Create New League
                </Button>
              </AlertToolbar>
            </Alert>
          </div>
        )}

        {draft && pdfData && (
          <div className="flex flex-row h-full w-full">
            <div className="w-1/2 h-full bg-background">
              <ScrollArea className="h-full w-full p-6">
                <div className="flex flex-col gap-6 pb-20">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        General Information
                      </CardTitle>
                      <CardDescription>
                        Basic details visible on the header.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>League Title</Label>
                        <Input
                          value={draft.league_title}
                          onChange={(e) =>
                            handleTextChange("league_title", e.target.value)
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Budget (₱)</Label>
                          <Input
                            type="number"
                            value={draft.league_budget}
                            onChange={(e) =>
                              handleTextChange(
                                "league_budget",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Venue</Label>
                          <Input
                            value={draft.league_address}
                            onChange={(e) =>
                              handleTextChange("league_address", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Schedule & Deadlines
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <DateTimeField
                        label="Opening Date"
                        dateIso={draft.opening_date}
                        onChange={(d) => handleDateChange("opening_date", d)}
                      />

                      <DateTimeField
                        label="Registration Deadline"
                        dateIso={draft.registration_deadline}
                        onChange={(d) =>
                          handleDateChange("registration_deadline", d)
                        }
                      />
                      <DatePickerField
                        label="League Start"
                        dateIso={draft.league_schedule[0]}
                        onChange={(d) => handleScheduleChange(0, d)}
                      />
                      <DatePickerField
                        label="League End"
                        dateIso={draft.league_schedule[1]}
                        onChange={(d) => handleScheduleChange(1, d)}
                      />

                      <div className="space-y-2 col-span-2">
                        <Label>Description</Label>
                        <Textarea
                          className="min-h-20"
                          placeholder="Brief description..."
                          value={draft.league_description}
                          onChange={(e) =>
                            handleTextChange(
                              "league_description",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-md">
                        Document Content
                      </CardTitle>
                      <CardDescription>
                        Edit the narrative parts of the document.
                        <span className="block mt-1 text-amber-600 font-medium text-xs">
                          *For Rationale & Rules: Each new line acts as a new
                          paragraph/value.
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Objective</Label>
                        <Textarea
                          className="min-h-20"
                          value={draft.league_objective}
                          onChange={(e) =>
                            handleTextChange("league_objective", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Rationale</Label>
                        <Textarea
                          className="min-h-[150px] font-mono text-sm leading-relaxed"
                          placeholder="Type each point on a new line..."
                          value={
                            Array.isArray(draft.league_rationale)
                              ? draft.league_rationale.join("\n")
                              : ""
                          }
                          onChange={(e) =>
                            handleArrayChange(
                              "league_rationale",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Sportsmanship Rules</Label>
                        <Textarea
                          className="min-h-[150px] font-mono text-sm leading-relaxed"
                          placeholder="One rule per line..."
                          value={
                            Array.isArray(draft.sportsmanship_rules)
                              ? draft.sportsmanship_rules.join("\n")
                              : ""
                          }
                          onChange={(e) =>
                            handleArrayChange(
                              "sportsmanship_rules",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </div>
            <div className="w-1/2 h-full flex flex-col relative">
              <div className="p-1 px-6 text-sm font-medium text-muted-foreground flex justify-between items-center z-10">
                <span>Document Preview</span>
                <span className="text-xs flex items-center gap-1 text-amber-600 px-2 py-1 rounded border">
                  <Info className="w-3 h-3" /> Auto-updates on pause
                </span>
              </div>
              <div className="flex-1 overflow-hidden p-2 relative">
                <PDFViewer
                  width="100%"
                  height="100%"
                  className="rounded-md shadow-sm"
                  showToolbar={true}
                >
                  <ActivityDesignDocument
                    league={pdfData}
                    leagueAdmin={pdfData.creator}
                  />
                </PDFViewer>
                {isPending && (
                  <div className="absolute inset-4 bg-white/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-md border border-slate-200 shadow-sm transition-all duration-300">
                    <div className="flex flex-col items-center gap-3 p-6 bg-card rounded-xl shadow-lg border">
                      <Spinner className="h-8 w-8" />
                      <p className="text-sm font-medium">
                        Generating Preview...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </ContentBody>
    </ContentShell>
  );
}
