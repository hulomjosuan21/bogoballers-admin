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
import { LeagueService } from "@/service/leagueService";
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
import { authLeagueAdminQueryOption } from "@/queries/leagueAdminQueryOption";
import { Check, ChevronsUpDown } from "lucide-react";
import type { BasicMultiSelectOption } from "@/components/ui/types";
import { getErrorMessage } from "@/lib/error";
import { useCategories } from "@/hooks/useLeagueAdmin";
import type { LeagueType } from "@/types/league";
import { refetchActiveLeague } from "@/hooks/useActiveLeague";

function validateLeagueForm({
  leagueTitle,
  overAllBudget,
  leagueDescription,
  rules,
  registrationDadline,
  openingDate,
  dateRange,
  leagueBanner,
  categories,
}: {
  leagueTitle: string;
  overAllBudget: number;
  leagueDescription: string;
  rules: string[];
  registrationDadline?: Date;
  openingDate?: Date;
  dateRange?: DateRange;
  leagueBanner: File | string | null;
  categories: string[];
}) {
  if (!leagueTitle.trim()) throw new Error("League title is required.");
  if (!leagueDescription.trim()) throw new Error("Description is required.");
  if (isNaN(overAllBudget) || overAllBudget < 0)
    throw new Error("Budget must be a non-negative number.");
  if (!rules.length)
    throw new Error("At least one sportsmanship rule is required.");
  if (!registrationDadline)
    throw new Error("Registration deadline is required.");
  if (!openingDate) throw new Error("Opening date is required.");
  if (!dateRange?.from || !dateRange?.to)
    throw new Error("League schedule range is required.");
  if (!leagueBanner) throw new Error("League banner image is required.");
  if (!categories || !categories.length)
    throw new Error("At least one category must be selected.");
}

export default function UpdateLeagueForm({
  hasActive,
  activeLeague,
  activeLeagueLoading,
}: {
  hasActive: boolean;
  activeLeague: LeagueType;
  activeLeagueLoading: boolean;
}) {
  const leagueAdmin = useQuery(authLeagueAdminQueryOption);
  const { categoriesData } = useCategories();

  const [leagueBanner, setLeagueBanner] = useState<File | string | null>(null);
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
  const [isProcessing, setProcessing] = useState(false);

  useEffect(() => {
    if (activeLeague && !activeLeagueLoading) {
      const league = activeLeague as LeagueType;

      setLeagueTitle(league.league_title || "");
      setLeagueDescription(league.league_description || "");
      setLeagueAddress(league.league_address || "");
      setOverAllBudget(league.league_budget || 0);
      setLeagueBanner(league.banner_url || null);
      setRules(league.sportsmanship_rules || []);

      if (league.registration_deadline) {
        setRegistrationDeadline(new Date(league.registration_deadline));
      }
      if (league.opening_date) {
        setOpeningDate(new Date(league.opening_date));
      }
      if (league.league_schedule && league.league_schedule.length === 2) {
        setDateRange({
          from: new Date(league.league_schedule[0]),
          to: new Date(league.league_schedule[1]),
        });
      }

      if (league.categories && categoriesData) {
        const selectedCats = league.categories.map((cat) => ({
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

        validateLeagueForm({
          leagueTitle,
          overAllBudget,
          leagueDescription,
          rules,
          registrationDadline,
          openingDate,
          dateRange,
          leagueBanner,
          categories: categoryIds,
        });

        const formData = new FormData();
        formData.append("league_title", leagueTitle);
        formData.append("league_budget", String(overAllBudget));
        formData.append("league_description", leagueDescription);
        formData.append("league_address", selectedAddress);
        formData.append("opening_date", openingDate!.toISOString());
        formData.append("categories", JSON.stringify(categoryIds));
        formData.append(
          "registration_deadline",
          registrationDadline!.toISOString()
        );
        formData.append(
          "league_schedule",
          JSON.stringify([
            dateRange?.from?.toISOString(),
            dateRange?.to?.toISOString(),
          ])
        );
        formData.append("sportsmanship_rules", JSON.stringify(rules));

        if (leagueBanner instanceof File) {
          formData.append("banner_image", leagueBanner);
        } else if (typeof leagueBanner === "string") {
          formData.append("banner_image", leagueBanner);
        }

        const response = await LeagueService.updateCurrent(
          activeLeague!.league_id,
          formData
        );

        await refetchActiveLeague();
        return response;
      } finally {
        setProcessing(false);
      }
    };

    toast.promise(updateLeague(), {
      loading: `Updating League ${leagueTitle}...`,
      success: (res) => {
        return res.message || "League updated successfully!";
      },
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

  return (
    <section
      className={cn("space-y-4", hasActive && "pointer-events-none opacity-50")}
    >
      <div
        className={disableOnLoading({
          condition: isProcessing,
          baseClass: "grid grid-cols-1 md:grid-cols-2 gap-6 items-start",
        })}
      >
        <div className="flex flex-col gap-4 h-full md:items-end">
          <div className="grid w-full max-w-md items-center space-y-2">
            <Label htmlFor="title">League Title</Label>
            <Input
              id="title"
              value={leagueTitle}
              onChange={(e) => setLeagueTitle(e.target.value)}
            />
            <p className="text-helper">e.g. Bogo City Summer League 2025</p>
          </div>

          <div className="grid w-full max-w-md items-center space-y-2">
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
            <p className="text-helper">Overall budget for the league.</p>
          </div>

          <div className="grid w-full max-w-md items-center space-y-2">
            <Label htmlFor="banner">League Banner</Label>
            <ImageUploadField
              value={leagueBanner}
              onChange={setLeagueBanner}
              allowUpload
              allowEmbed
              iconOnly={false}
              aspect={16 / 9}
            />
            <p className="text-helper">
              Upload a square banner to represent the league visually.
            </p>
          </div>

          <div className="grid w-full max-w-md items-center space-y-2">
            <Label htmlFor="address">League Address</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  id="address"
                  className={cn(
                    "justify-between",
                    !selectedAddress && "text-muted-foreground"
                  )}
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
                          value={address}
                          key={address}
                          onSelect={() => {
                            setLeagueAddress(address);
                          }}
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
            <p className="text-helper">
              Default address where this league going to happen.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 h-full items-start">
          <div className="grid w-full max-w-md items-center space-y-2">
            <Label htmlFor="team-reg">Registration Deadline</Label>
            <DateTimePicker
              setDateTime={setRegistrationDeadline}
              dateTime={registrationDadline}
            />
            <p className="text-helper">
              Deadline for participants to register.
            </p>
          </div>

          <div className="grid w-full max-w-md items-center space-y-2">
            <Label htmlFor="opening-sched">Opening Schedule</Label>
            <DateTimePicker
              setDateTime={setOpeningDate}
              dateTime={openingDate}
            />
            <p className="text-helper">
              Opening day, usually marked by a parade or ceremony.
            </p>
          </div>

          <div className="grid w-full max-w-md items-center gap-3">
            <Label htmlFor="league-sched">League Schedule</Label>
            <DatePickerWithRange
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
            <p className="text-helper">
              Select when all league matches are expected to start and end.
            </p>
          </div>
        </div>
      </div>

      <div
        className={disableOnLoading({
          condition: isProcessing,
          baseClass: "grid space-y-2",
        })}
      >
        <Label htmlFor="description">League Description</Label>
        <Textarea
          value={leagueDescription}
          onChange={(e) => setLeagueDescription(e.target.value)}
          id="description"
          className="h-24"
        />

        <p className="text-helper">
          Briefly describe the league's purpose, scope, and any notable
          information that participants should know. This will be visible on the
          league's public page.
        </p>
      </div>

      <div
        className={disableOnLoading({
          condition: isProcessing,
          baseClass: "grid space-y-2",
        })}
      >
        <Label>Select Sportsmanship Rules</Label>
        <MultiSelect
          id="rules"
          options={StaticData.SportsmanshipRules}
          onValueChange={(values) => setRules(values)}
          defaultValue={rules}
          maxCount={8}
        />

        <p className="text-helper">
          List the rules that promote fair play, respect, and positive behavior
          during the league. These will guide how players, coaches, and
          spectators are expected to conduct themselves.
        </p>
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
