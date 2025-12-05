import { useEffect, useState, useTransition, useMemo } from "react";
import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Info, Save, RotateCcw, CalendarIcon, Loader2 } from "lucide-react";
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

export default function LeagueUpdatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  // --- 1. DATA FETCHING ---
  const { data: serverData, isLoading } = useQuery({
    queryKey: ["active-league-data"],
    queryFn: () => LeagueService.fetchActive(),
    staleTime: Infinity, // Keep data fresh to avoid background overwrites
    refetchOnWindowFocus: false,
  });

  // --- 2. STATE MANAGEMENT ---
  // 'draft' controls the Form Inputs (Immediate UI response)
  const [draft, setDraft] = useState<League | null>(null);
  // 'pdfData' controls the PDF Preview (Deferred/Transitioned update)
  const [pdfData, setPdfData] = useState<League | null>(null);

  // Sync Server Data to Local State on Load
  useEffect(() => {
    if (serverData) {
      const clonedData = JSON.parse(JSON.stringify(serverData));
      setDraft(clonedData);
      setPdfData(clonedData);
    }
  }, [serverData]);

  // Sync Draft to PDF Data with low priority (Optimization)
  useEffect(() => {
    if (draft) {
      startTransition(() => {
        setPdfData(draft);
      });
    }
  }, [draft]);

  // --- 3. CHANGE DETECTION (Diffing) ---
  const getDirtyFields = (
    original: League,
    current: League
  ): Partial<League> => {
    const changes: Partial<League> = {};
    (Object.keys(current) as Array<keyof League>).forEach((key) => {
      // Simple JSON stringify comparison handles Arrays and Objects efficiently for this data size
      if (JSON.stringify(original[key]) !== JSON.stringify(current[key])) {
        // @ts-ignore - dynamic assignment
        changes[key] = current[key];
      }
    });
    return changes;
  };

  // Check if anything changed to enable/disable Save button
  const isDirty = useMemo(() => {
    if (!serverData || !draft) return false;
    return JSON.stringify(serverData) !== JSON.stringify(draft);
  }, [serverData, draft]);

  // --- 4. MUTATION (SAVE) ---
  const updateMutation = useMutation({
    mutationFn: (changes: Partial<League>) =>
      leagueService.updateLeague(serverData!.league_id, changes),
    onSuccess: () => {
      toast.success("League details updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["active-league-data"] });
      // Note: serverData update triggers useEffect, which resets draft/pdfData to new server state
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

    updateMutation.mutate(changes);
  };

  const handleReset = () => {
    if (serverData) {
      const resetData = JSON.parse(JSON.stringify(serverData));
      setDraft(resetData);
      startTransition(() => setPdfData(resetData));
    }
  };

  // --- 5. INPUT HANDLERS ---
  const handleTextChange = (field: keyof League, value: string | number) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleArrayChange = (field: keyof League, value: string) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value.split("\n") } : null));
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

  // --- 6. HELPER COMPONENTS ---
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
                className="bg-blue-600 hover:bg-blue-700"
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
        </div>
      </ContentHeader>

      <ContentBody className="p-0 overflow-hidden h-[calc(100vh-60px)]">
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
            {/* --- LEFT: FORM (Immediate Updates) --- */}
            <div className="w-1/2 h-full border-r bg-background">
              <ScrollArea className="h-full w-full p-6">
                <div className="flex flex-col gap-6 pb-20">
                  {/* General Info */}
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

                  {/* Schedule & Dates */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Schedule & Deadlines
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <DatePickerField
                        label="Opening Date"
                        dateIso={draft.opening_date}
                        onChange={(d) => handleDateChange("opening_date", d)}
                      />
                      <DatePickerField
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
                    </CardContent>
                  </Card>

                  {/* Text Content */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Document Content
                      </CardTitle>
                      <CardDescription>
                        Edit the narrative parts of the document.
                        <span className="block mt-1 text-amber-600 font-medium text-xs">
                          *For Rationale & Rules: Each new line acts as a new
                          paragraph/bullet point.
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          className="min-h-[80px]"
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

                      <div className="space-y-2">
                        <Label>Objective</Label>
                        <Textarea
                          className="min-h-[80px]"
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
                          placeholder="Reason 1...&#10;Reason 2..."
                          value={
                            Array.isArray(draft.league_rationale)
                              ? draft.league_rationale.join("\n")
                              : ""
                          }
                          onChange={(e) =>
                            handleArrayChange(
                              "league_rationale",
                              e.target.value.split("\n") as any // Forces TS to ignore the type mismatch
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Sportsmanship Rules</Label>
                        <Textarea
                          className="min-h-[150px] font-mono text-sm leading-relaxed"
                          placeholder="Rule 1...&#10;Rule 2..."
                          value={draft.sportsmanship_rules.join("\n")}
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

            {/* --- RIGHT: PDF PREVIEW (Transitioned Updates) --- */}
            <div className="w-1/2 h-full bg-slate-100 flex flex-col border-l relative">
              <div className="bg-white border-b p-2 px-6 text-sm font-medium text-muted-foreground flex justify-between items-center z-10">
                <span>Document Preview</span>
                <span className="text-xs flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  <Info className="w-3 h-3" /> Auto-updates on pause
                </span>
              </div>

              {/* PDF Container */}
              <div className="flex-1 overflow-hidden p-4 relative">
                <PDFViewer
                  width="100%"
                  height="100%"
                  className="rounded-md shadow-sm border bg-white"
                  showToolbar={true}
                >
                  <ActivityDesignDocument
                    league={pdfData} // Uses the deferred state
                    leagueAdmin={pdfData.creator}
                  />
                </PDFViewer>

                {/* --- OPTIMIZATION: LOADING SPINNER OVERLAY --- */}
                {isPending && (
                  <div className="absolute inset-4 bg-white/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-md border border-slate-200 shadow-sm transition-all duration-300">
                    <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-lg border">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                      <p className="text-sm font-medium text-slate-600">
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
