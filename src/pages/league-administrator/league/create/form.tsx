import { MultiSelect } from "@/components/multi-select";
import { Label } from "@/components/ui/label";
import { StaticData } from "@/data";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/datetime-picker";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { ImageUploadField } from "@/components/image-upload-field";
import type { DateRange } from "react-day-picker";
import dayjs from "dayjs";
import { useErrorToast } from "@/components/error-toast";
import { Separator } from "@/components/ui/separator";
import { LeagueService } from "@/service/league-service";
import { toast } from "sonner";

import { ButtonLoading } from "@/components/custom-buttons";
import { disableOnLoading } from "@/lib/app_utils";
import { useQueries } from "@tanstack/react-query";
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
import { getActiveLeagueQueryOption } from "@/queries/league";
import { authLeagueAdminQueryOption } from "@/queries/league-admin";
import { Check, ChevronsUpDown } from "lucide-react";

function validateLeagueForm({
  leagueTitle,
  overAllBudget,
  leagueDescription,
  rules,
  registrationDadline,
  openingDate,
  dateRange,
  leagueBanner,
}: {
  leagueTitle: string;
  overAllBudget: number;
  leagueDescription: string;
  rules: string[];
  registrationDadline?: Date;
  openingDate?: Date;
  dateRange?: DateRange;
  leagueBanner: File | string | null;
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
}

type Props = {
  hasActive: boolean;
};

export default function CreateLeagueForm({ hasActive }: Props) {
  const [activeLeague, leagueAdmin] = useQueries({
    queries: [getActiveLeagueQueryOption, authLeagueAdminQueryOption],
  });
  const [leagueBanner, setLeagueBanner] = useState<File | string | null>(null);
  const [leagueTitle, setLeagueTitle] = useState("");
  const [leagueDescription, setLeagueDescription] = useState("");
  const [selectedAddress, setLeagueAddress] = useState("");

  const [overAllBudget, setOverAllBudget] = useState(0);
  const [registrationDadline, setRegistrationDeadline] = useState<Date>();
  const [openingDate, setOpeningDate] = useState<Date>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: dayjs().add(20, "day").toDate(),
  });
  const [rules, setRules] = useState<string[]>([]);
  const [isProcessing, setProcessing] = useState(false);

  const handleError = useErrorToast();

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      validateLeagueForm({
        leagueTitle,
        overAllBudget,
        leagueDescription,
        rules,
        registrationDadline,
        openingDate,
        dateRange,
        leagueBanner,
      });

      const formData = new FormData();
      formData.append("league_title", leagueTitle);
      formData.append("league_budget", String(overAllBudget));
      formData.append("league_description", leagueDescription);
      formData.append("league_address", selectedAddress);
      formData.append("opening_date", openingDate!.toISOString());
      formData.append(
        "registration_deadline",
        registrationDadline!.toISOString()
      );
      formData.append(
        "league_schedule",
        JSON.stringify([dateRange?.from, dateRange?.to])
      );
      formData.append("sportsmanship_rules", JSON.stringify(rules));
      if (leagueBanner instanceof File) {
        formData.append("banner_image", leagueBanner);
      } else if (typeof leagueBanner === "string") {
        formData.append("banner_image", leagueBanner);
      }

      const res = await LeagueService.createNewLeague(formData);

      await activeLeague.refetch();
      toast.success(res.message);
    } catch (err) {
      if (err instanceof Error) {
        handleError(err);
      } else {
        console.error();
        handleError(`Unexpected error: ${err}`);
      }
    } finally {
      setProcessing(false);
    }
  };

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
                defaultValue={overAllBudget}
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
                  {leagueAdmin.data?.organization_address ||
                    selectedAddress ||
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
          onChange={(e) => setLeagueDescription(e.target.value)}
          id="description"
          className="h-24"
        />

        <p className="text-helper">
          Briefly describe the league’s purpose, scope, and any notable
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
        <Label htmlFor="rules">Select Sportsmanship Rules</Label>
        <MultiSelect
          id="rules"
          options={StaticData.SportsmanshipRules}
          onValueChange={(values) => setRules(values)}
          maxCount={8}
        />

        <p className="text-helper">
          List the rules that promote fair play, respect, and positive behavior
          during the league. These will guide how players, coaches, and
          spectators are expected to conduct themselves.
        </p>
      </div>

      <p
        className={disableOnLoading({
          condition: isProcessing,
          baseClass: "text-helper",
        })}
      >
        Define the competition category (e.g., category, fees). Participants
        will register under these categories.
      </p>

      <Separator />

      <ButtonLoading
        loading={isProcessing}
        onClick={handleSubmit}
        className="w-full"
      >
        Create
      </ButtonLoading>
    </section>
  );
}
