import { MultiSelect } from "@/components/multi-select";
import { Label } from "@/components/ui/label";
import { StaticData } from "@/data";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/datetime-picker";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { ImageUploadField } from "@/components/image-upload-field";
import type { DateRange } from "react-day-picker";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ButtonLoading } from "@/components/custom-buttons";
import { disableOnLoading } from "@/lib/app_utils";
import { useQuery } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authLeagueAdminQueryOption } from "@/queries/leagueAdminQueryOption";
import { Check, ChevronsUpDown } from "lucide-react";
import type { BasicMultiSelectOption } from "@/components/ui/types";
import { getErrorMessage } from "@/lib/error";
import { useCategories } from "@/hooks/useLeagueAdmin";
import { refetchActiveLeague } from "@/hooks/useActiveLeague";
import type { League } from "@/types/league";
import { LeagueService } from "@/service/leagueService";
import { useUpdateEntityImage } from "@/hooks/useUpdateEntityImage";

export type LeagueUpdatePayload = {
  league_title?: string;
  league_description?: string;
  league_address?: string;
  league_budget?: number;
  banner_url?: File | string | null;
  sportsmanship_rules?: string[];
  registration_deadline?: string;
  opening_date?: string;
  league_categories?: string[];
  status?: string;
};

export default function UpdateLeagueForm({
  hasActive,
  activeLeague,
  activeLeagueLoading,
  leagueId,
}: {
  leagueId: string;
  hasActive: boolean;
  activeLeague: League;
  activeLeagueLoading: boolean;
}) {
  const leagueAdmin = useQuery(authLeagueAdminQueryOption({ enabled: true }));
  const { categoriesData } = useCategories();

  const [leagueTitle, setLeagueTitle] = useState("");
  const [leagueDescription, setLeagueDescription] = useState("");
  const [selectedAddress, setLeagueAddress] = useState("");
  const [selectedCategories, setCategories] = useState<
    BasicMultiSelectOption[]
  >([]);
  const [overAllBudget, setOverAllBudget] = useState(0);
  const [registrationDadline, setRegistrationDeadline] = useState<Date>();
  const [openingDate, setOpeningDate] = useState<Date>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [rules, setRules] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");
  const [isProcessing, setProcessing] = useState(false);

  const [leagueBanner, setLeagueBanner] = useState<File | string | null>(null);
  const { updateImage, loading } = useUpdateEntityImage();
  const hasChanges =
    leagueBanner instanceof File ||
    (typeof leagueBanner === "string" &&
      leagueBanner != activeLeague.banner_url);
  const handleSave = async () => {
    if (!leagueBanner) return;
    await updateImage(leagueId, "league", leagueBanner);
  };

  useEffect(() => {
    if (activeLeague && !activeLeagueLoading) {
      setLeagueTitle(activeLeague.league_title || "");
      setLeagueDescription(activeLeague.league_description || "");
      setLeagueAddress(activeLeague.league_address || "");
      setOverAllBudget(activeLeague.league_budget || 0);
      setLeagueBanner(activeLeague.banner_url || null);
      setRules(activeLeague.sportsmanship_rules || []);
      setStatus(activeLeague.status || "Scheduled");

      if (activeLeague.registration_deadline) {
        setRegistrationDeadline(new Date(activeLeague.registration_deadline));
      }
      if (activeLeague.opening_date) {
        setOpeningDate(new Date(activeLeague.opening_date));
      }
      if (activeLeague.league_categories && categoriesData) {
        const selectedCats = activeLeague.league_categories.map((cat) => ({
          value: cat.category_id,
          label: cat.category_name,
        }));
        setCategories(selectedCats);
      }
    }
  }, [activeLeague, activeLeagueLoading, categoriesData]);

  const handleSubmit = async () => {
    if (!activeLeague?.league_id) {
      toast.error("No league found to update");
      return;
    }

    setProcessing(true);
    const updateLeague = async () => {
      try {
        const categoryIds = selectedCategories.map((opt) => opt.value);
        const payload: Partial<LeagueUpdatePayload> = {};

        // Only include changed fields
        if (leagueTitle !== activeLeague.league_title) {
          payload.league_title = leagueTitle;
        }
        if (leagueDescription !== activeLeague.league_description) {
          payload.league_description = leagueDescription;
        }
        if (selectedAddress !== activeLeague.league_address) {
          payload.league_address = selectedAddress;
        }
        if (overAllBudget !== activeLeague.league_budget) {
          payload.league_budget = overAllBudget;
        }
        if (leagueBanner !== activeLeague.banner_url) {
          payload.banner_url = leagueBanner;
        }
        if (
          rules.join(",") !== (activeLeague.sportsmanship_rules || []).join(",")
        ) {
          payload.sportsmanship_rules = rules;
        }
        if (
          registrationDadline &&
          registrationDadline.toISOString() !==
            activeLeague.registration_deadline
        ) {
          // Send ISO string to match backend expectation
          payload.registration_deadline = registrationDadline.toISOString();
        }
        if (
          openingDate &&
          openingDate.toISOString() !== activeLeague.opening_date
        ) {
          // Send ISO string to match backend expectation
          payload.opening_date = openingDate.toISOString();
        }
        if (
          categoryIds.join(",") !==
          activeLeague.league_categories.map((c) => c.category_id).join(",")
        ) {
          payload.league_categories = categoryIds;
        }
        if (status !== activeLeague.status) {
          payload.status = status;
        }

        // Only send request if there are changes
        if (Object.keys(payload).length === 0) {
          toast.info("No changes detected");
          setProcessing(false);
          return { message: "No changes to update" };
        }

        const response = await LeagueService.updateOne(leagueId, payload);

        await refetchActiveLeague();
        return response;
      } catch (err) {
        throw err;
      } finally {
        setProcessing(false);
      }
    };

    toast.promise(updateLeague(), {
      loading: `Updating League ${leagueTitle}...`,
      success: (res) => res.message,
      error: (err) => getErrorMessage(err) ?? "Something went wrong!",
    });
  };

  if (activeLeagueLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!activeLeague) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No active league found to update.
        </p>
      </div>
    );
  }

  // Define status options
  const statusOptions = [
    { value: "Scheduled", label: "Scheduled" },
    { value: "Ongoing", label: "Ongoing" },
    { value: "Completed", label: "Completed" },
    { value: "Postponed", label: "Postponed" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  return (
    <section
      className={cn("space-y-6", hasActive && "pointer-events-none opacity-50")}
    >
      <div
        className={disableOnLoading({
          condition: isProcessing,
          baseClass:
            "flex flex-col md:flex-row md:justify-start gap-6 items-start",
        })}
      >
        <div className="flex flex-col gap-4 w-full max-w-md">
          <Label htmlFor="title">League Title</Label>
          <Input
            id="title"
            value={leagueTitle}
            onChange={(e) => setLeagueTitle(e.target.value)}
          />
          <p className="text-helper">e.g. Bogo City Summer League 2025</p>

          <Label htmlFor="budget">League Budget</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">₱</span>
            <Input
              id="budget"
              type="number"
              value={overAllBudget}
              onChange={(e) => {
                const value = Number(e.target.value.trim());
                setOverAllBudget(isNaN(value) ? 0 : value);
              }}
            />
          </div>

          <div className="grid gap-4">
            <Label htmlFor="banner">League Banner</Label>
            <div className="flex gap-2 items-center">
              <ImageUploadField
                value={leagueBanner}
                onChange={setLeagueBanner}
                allowUpload
                allowEmbed
                aspect={16 / 9}
              />
              {hasChanges && (
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  variant={"outline"}
                  size={"sm"}
                >
                  {loading ? "Updating..." : "Save Banner"}
                </Button>
              )}
            </div>
          </div>

          <Label htmlFor="address">League Address</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                id="address"
                className="justify-between"
              >
                {selectedAddress ||
                  leagueAdmin.data?.organization_address ||
                  "Select Address"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput
                  placeholder={leagueAdmin.data?.organization_address}
                />
                <CommandList>
                  <CommandEmpty>No address found.</CommandEmpty>
                  <CommandGroup>
                    {StaticData.Barangays.map((address) => (
                      <CommandItem
                        key={address}
                        onSelect={() => setLeagueAddress(address)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            address === selectedAddress
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {address}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4 w-full max-w-md">
          <Label>Registration Deadline</Label>
          <DateTimePicker
            setDateTime={setRegistrationDeadline}
            dateTime={registrationDadline}
          />

          <Label>Opening Schedule</Label>
          <DateTimePicker setDateTime={setOpeningDate} dateTime={openingDate} />

          <Label>League Schedule</Label>
          <DatePickerWithRange
            dateRange={dateRange}
            setDateRange={setDateRange}
          />

          <Label htmlFor="status">League Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">League Description</Label>
        <Textarea
          id="description"
          value={leagueDescription}
          onChange={(e) => setLeagueDescription(e.target.value)}
          className="h-24"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Select Sportsmanship Rules</Label>
        <MultiSelect
          id="rules"
          options={StaticData.SportsmanshipRules}
          onValueChange={setRules}
          defaultValue={rules}
          maxCount={8}
        />
      </div>

      <Separator />

      <ButtonLoading
        loading={isProcessing}
        onClick={handleSubmit}
        className="w-full"
      >
        Update League
      </ButtonLoading>
    </section>
  );
}
