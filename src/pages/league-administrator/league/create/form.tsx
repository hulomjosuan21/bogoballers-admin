import { MultiSelect } from "@/components/multi-select";
import { Label } from "@/components/ui/label";
import { MinimalTiptap } from "@/components/ui/shadcn-io/minimal-tiptap";
import { StaticData } from "@/data";
import type { CreateLeagueCategory } from "@/types/league";
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
import LeagueService from "@/service/league-service";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ButtonLoading } from "@/components/custom-buttons";
import { disableOnLoading } from "@/lib/utils";

interface CreateLeagueFormProps {
  hasLeague: boolean;
}

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
  categories: CreateLeagueCategory[];
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
  if (!categories.length) throw new Error("At least one category is required.");
}

export default function CreateLeagueForm({}: CreateLeagueFormProps) {
  const [leagueBanner, setLeagueBanner] = useState<File | string | null>(null);
  const [leagueTitle, setLeagueTitle] = useState("");
  const [leagueDescription, setLeagueDescription] = useState("");
  const [overAllBudget, setOverAllBudget] = useState(0);
  const [registrationDadline, setRegistrationDeadline] = useState<Date>();
  const [openingDate, setOpeningDate] = useState<Date>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: dayjs().add(20, "day").toDate(),
  });
  const [categories, setCategories] = useState<CreateLeagueCategory[]>([]);
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
        categories,
      });

      const formData = new FormData();
      formData.append("league_title", leagueTitle);
      formData.append("league_budget", String(overAllBudget));
      formData.append("league_description", leagueDescription);
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
      formData.append("categories", JSON.stringify(categories));

      const res = await LeagueService.createNewLeague(formData);

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
    <section className="space-y-4">
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
        <Label htmlFor="rules">League Description</Label>
        <MinimalTiptap
          onChange={setLeagueDescription}
          placeholder="Start typing your leagueDescription here..."
          className="min-h-[400px]"
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

      <AddCategories
        loading={isProcessing}
        categories={categories}
        setCategories={setCategories}
      />

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

function AddCategories({
  loading,
  categories,
  setCategories,
}: {
  loading: boolean;
  categories: CreateLeagueCategory[];
  setCategories: React.Dispatch<React.SetStateAction<CreateLeagueCategory[]>>;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [form, setForm] = useState<CreateLeagueCategory>({
    category_name: "",
    max_team: 0,
    accept_teams: false,
    team_entrance_fee_amount: 0,
    individual_player_entrance_fee_amount: 0,
  });

  const handleChange = (field: keyof CreateLeagueCategory, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      category_name: "",
      max_team: 0,
      accept_teams: false,
      team_entrance_fee_amount: 0,
      individual_player_entrance_fee_amount: 0,
    });
    setSelectedIndex(null);
    setDialogOpen(false);
  };

  const handleSave = () => {
    if (selectedIndex !== null) {
      const updated = [...categories];
      updated[selectedIndex] = form;
      setCategories(updated);
    } else {
      setCategories((prev) => [...prev, form]);
    }
    resetForm();
  };

  const handleEdit = (index: number) => {
    setForm(categories[index]);
    setSelectedIndex(index);
    setDialogOpen(true);
  };

  const handleDelete = (index: number) => {
    const updated = [...categories];
    updated.splice(index, 1);
    setCategories(updated);
  };

  return (
    <div
      className={disableOnLoading({
        condition: loading,
        baseClass: "space-y-4",
      })}
    >
      <div className="flex items-center justify-between">
        <Label>League Categories</Label>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm">
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedIndex !== null ? "Edit" : "Add"} League Category
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category_name">Category Name</Label>
                <Select
                  value={form.category_name}
                  onValueChange={(value) =>
                    handleChange("category_name", value)
                  }
                >
                  <SelectTrigger id="category_name">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {StaticData.ListOfCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_team">Max Teams</Label>
                <Input
                  id="max_team"
                  type="number"
                  value={form.max_team}
                  onChange={(e) =>
                    handleChange("max_team", parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={form.accept_teams}
                  onCheckedChange={(checked) =>
                    handleChange("accept_teams", !!checked)
                  }
                />
                <Label htmlFor="accept_teams">Accept Teams</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team_fee">Team Entrance Fee</Label>
                <Input
                  id="team_fee"
                  type="number"
                  value={form.team_entrance_fee_amount}
                  onChange={(e) =>
                    handleChange(
                      "team_entrance_fee_amount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="individual_fee">Individual Entrance Fee</Label>
                <Input
                  id="individual_fee"
                  type="number"
                  value={form.individual_player_entrance_fee_amount}
                  onChange={(e) =>
                    handleChange(
                      "individual_player_entrance_fee_amount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>
                {selectedIndex !== null ? "Update" : "Add"} Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>Category</TableHead>
              <TableHead>Max Teams</TableHead>
              <TableHead>Accept Teams</TableHead>
              <TableHead>Team Fee</TableHead>
              <TableHead>Individual Fee</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat, idx) => (
              <TableRow key={idx}>
                <TableCell>{cat.category_name}</TableCell>
                <TableCell>{cat.max_team}</TableCell>
                <TableCell>{cat.accept_teams ? "Yes" : "No"}</TableCell>
                <TableCell>
                  ₱{cat.team_entrance_fee_amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  ₱{cat.individual_player_entrance_fee_amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(idx)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(idx)}
                        className="text-red-500"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
