import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type CreateLeagueCategory,
  type MatchCategory,
  type FormatType,
  matchCategories,
  formatTypes,
} from "@/types/league";
import { Checkbox } from "@/components/ui/checkbox";
import { StaticData } from "@/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { formatPeso } from "@/lib/formatCurrency";

type Props = {
  categories: CreateLeagueCategory[];
  setCategories: React.Dispatch<React.SetStateAction<CreateLeagueCategory[]>>;
};

export default function LeagueCategoryManager({
  categories,
  setCategories,
}: Props) {
  const [categoryName, setCategoryName] = useState("");
  const [maxTeam, setMaxTeam] = useState<number>(0);
  const [acceptTeams, setAcceptTeams] = useState<number>(0);
  const [teamFee, setTeamFee] = useState<number>(0);
  const [individualFee, setIndividualFee] = useState<number>(0);
  const [categoryFormats, setCategoryFormats] = useState<
    { format_round: MatchCategory; format: FormatType }[]
  >([]);
  const [tempFormatRound, setTempFormatRound] = useState<MatchCategory | "">(
    ""
  );
  const [tempFormat, setTempFormat] = useState<FormatType | "">("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addCategoryFormat = () => {
    if (tempFormatRound && tempFormat) {
      setCategoryFormats((prev) => [
        ...prev,
        {
          format_round: tempFormatRound as MatchCategory,
          format: tempFormat as FormatType,
        },
      ]);
      setTempFormatRound("");
      setTempFormat("");
    }
  };

  const handleSaveCategory = () => {
    if (
      !categoryName ||
      maxTeam <= 0 ||
      teamFee < 0 ||
      individualFee < 0 ||
      categoryFormats.length === 0
    ) {
      toast.error("Please fill in all fields and add at least one format.");
      return;
    }

    const newCategory: CreateLeagueCategory = {
      category_name: categoryName,
      category_format: categoryFormats,
      max_team: maxTeam,
      accept_teams: acceptTeams === 1,
      team_entrance_fee_amount: teamFee,
      individual_player_entrance_fee_amount: individualFee,
    };

    if (editingIndex !== null) {
      const updated = [...categories];
      updated[editingIndex] = newCategory;
      setCategories(updated);
    } else {
      setCategories([...categories, newCategory]);
    }

    resetForm();
    setDialogOpen(false);
  };

  const resetForm = () => {
    setCategoryName("");
    setMaxTeam(0);
    setAcceptTeams(0);
    setTeamFee(0);
    setIndividualFee(0);
    setCategoryFormats([]);
    setTempFormat("");
    setTempFormatRound("");
    setEditingIndex(null);
  };

  const handleEditCategory = (index: number) => {
    const cat = categories[index];
    setCategoryName(cat.category_name);
    setMaxTeam(cat.max_team);
    setAcceptTeams(cat.accept_teams ? 1 : 0);
    setTeamFee(cat.team_entrance_fee_amount);
    setIndividualFee(cat.individual_player_entrance_fee_amount);
    setCategoryFormats(cat.category_format);
    setEditingIndex(index);
    setDialogOpen(true);
  };

  const handleRemoveCategory = (index: number) => {
    const updated = [...categories];
    updated.splice(index, 1);
    setCategories(updated);
  };

  const usedCategoryNames = categories
    .map((cat, i) =>
      editingIndex !== null && editingIndex === i ? null : cat.category_name
    )
    .filter(Boolean) as string[];
  const usedRounds = categoryFormats.map((f) => f.format_round);
  const usedFormats = categoryFormats.map((f) => f.format);

  return (
    <div className="space-y-4">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size={"sm"}
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
            Add Category
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Edit" : "Create"} League Category
            </DialogTitle>
            <DialogDescription>
              Fill out category details and add formats
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Category Name</Label>
            <Select value={categoryName} onValueChange={setCategoryName}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {StaticData.ListOfCategories.filter(
                  (item) => !usedCategoryNames.includes(item)
                ).map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label>Max Teams</Label>
            <Input
              type="number"
              defaultValue={maxTeam}
              onChange={(e) => setMaxTeam(Number(e.target.value))}
            />

            <Label>Team Entrance Fee</Label>
            <Input
              type="number"
              defaultValue={teamFee}
              onChange={(e) => setTeamFee(Number(e.target.value))}
            />

            <Label>Individual Entrance Fee</Label>
            <Input
              type="number"
              defaultValue={individualFee}
              onChange={(e) => setIndividualFee(Number(e.target.value))}
            />

            <div className="space-y-2">
              <Label>Add Format</Label>
              <div className="flex gap-2">
                <Select
                  value={tempFormatRound}
                  onValueChange={(value) =>
                    setTempFormatRound(value as MatchCategory)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Round" />
                  </SelectTrigger>
                  <SelectContent>
                    {matchCategories
                      .filter((item) => !usedRounds.includes(item))
                      .map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Select
                  value={tempFormat}
                  onValueChange={(value) => setTempFormat(value as FormatType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Format" />
                  </SelectTrigger>
                  <SelectContent>
                    {formatTypes
                      .filter((item) => !usedFormats.includes(item))
                      .map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button onClick={addCategoryFormat}>Add</Button>
              </div>
              <div className="space-y-1">
                {categoryFormats.map((format, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm text-muted-foreground bg-muted px-2 py-1 rounded"
                  >
                    <span>
                      {format.format_round} - {format.format}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCategoryFormats((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      <X />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="accept-teams"
                checked={acceptTeams === 1}
                onCheckedChange={(checked) => setAcceptTeams(checked ? 1 : 0)}
              />
              <p className="text-sm text-muted-foreground">
                Enable this to allow teams to register for this category now.
              </p>
            </div>

            <Button className="w-full mt-4" onClick={handleSaveCategory}>
              {editingIndex !== null ? "Save Changes" : "Add Category to List"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>Name</TableHead>
              <TableHead>Max</TableHead>
              <TableHead>Accept</TableHead>
              <TableHead>Team Fee</TableHead>
              <TableHead>Individual Fee</TableHead>
              <TableHead>Formats</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No categories added.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat, index) => (
                <TableRow key={index}>
                  <TableCell>{cat.category_name}</TableCell>
                  <TableCell>{cat.max_team}</TableCell>
                  <TableCell>{cat.accept_teams ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    {formatPeso(cat.team_entrance_fee_amount)}
                  </TableCell>
                  <TableCell>
                    {formatPeso(cat.individual_player_entrance_fee_amount)}
                  </TableCell>
                  <TableCell>
                    <div className="line-clamp-2">
                      {cat.category_format
                        .map((f) => `${f.format_round} - ${f.format}`)
                        .join(", ")}
                    </div>
                  </TableCell>
                  <TableCell className="text-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditCategory(index)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRemoveCategory(index)}
                        >
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
