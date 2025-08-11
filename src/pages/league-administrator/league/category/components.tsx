import { ButtonLoading } from "@/components/custom-buttons";
import { useErrorToast } from "@/components/error-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StaticData } from "@/data";
import { RoundStateEnum, RoundTypeEnum } from "@/enums/enums";
import { getActiveLeagueQueryOptions } from "@/queries/league";
import LeagueService from "@/service/league-service";
import type { CreateLeagueCategory } from "@/types/league";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Round: {round.label}</DialogTitle>
        </DialogHeader>

        <div>
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

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCategoryDialog({
  open,
  onOpenChange,
}: AddCategoryDialogProps) {
  const { data: activeLeague, refetch } = useQuery(getActiveLeagueQueryOptions);
  const handleError = useErrorToast();
  const [isProcessing, setProcess] = useState(false);

  const [form, setForm] = useState<CreateLeagueCategory>({
    category_name: "",
    max_team: 0,
    accept_teams: false,
    team_entrance_fee_amount: 0,
    individual_player_entrance_fee_amount: 0,
  });

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!form.category_name) {
      toast.error("Category name is required");
      return false;
    }
    if (form.max_team <= 0) {
      toast.error("Max teams must be greater than 0");
      return false;
    }
    if (form.team_entrance_fee_amount < 0) {
      toast.error("Team entrance fee cannot be negative");
      return false;
    }
    if (form.individual_player_entrance_fee_amount < 0) {
      toast.error("Individual entrance fee cannot be negative");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setProcess(true);
    try {
      if (!activeLeague?.league_id) {
        throw new Error("No League Id");
      }
      const res = await LeagueService.createCategory({
        leagueId: activeLeague.league_id,
        data: form,
      });
      await refetch();
      toast.success(res.message);
    } catch (e) {
      handleError(e);
    } finally {
      setForm({
        category_name: "",
        max_team: 0,
        accept_teams: false,
        team_entrance_fee_amount: 0,
        individual_player_entrance_fee_amount: 0,
      });
      onOpenChange(false);
      setProcess(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Add League Category</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category_name">Category Name</Label>
            <Select
              value={form.category_name}
              onValueChange={(value) => handleChange("category_name", value)}
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
          <ButtonLoading
            onClick={handleSave}
            loading={isProcessing}
            className="w-full"
          >
            Add Category
          </ButtonLoading>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
