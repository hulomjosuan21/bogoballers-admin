import { MultiSelect } from "@/components/multi-select";
import { Label } from "@/components/ui/label";
import { MinimalTiptap } from "@/components/ui/shadcn-io/minimal-tiptap";
import { StaticData } from "@/data";
import type { CreateLeagueCategory } from "@/types/league";
import { useState } from "react";
import { z } from "zod";
import LeagueCategoryManager from "./category-manager";
import { Button } from "@/components/ui/button";

const CreateLeagueFormSchema = () =>
  z.object({
    league_title: z.string().min(1, "League title is required"),
    league_banner: z.union([z.instanceof(File), z.string().url()]).refine(
      (val) => {
        if (val instanceof File) return val.size > 0;
        return typeof val === "string" && val.trim().length > 0;
      },
      { message: "League banner is required" }
    ),
    budget: z.coerce
      .number()
      .min(0, "Budget must be at least ₱0")
      .max(10000, "Budget cannot exceed ₱10,000"),
    registration_deadline: z.coerce
      .date()
      .min(new Date(), "Registration deadline must be in the future"),
    opening_date: z.coerce
      .date()
      .min(new Date(), "Opening date must be in the future"),
    start_date: z.coerce
      .date()
      .min(new Date(), "Start date must be in the future"),
    league_description: z.string().min(1, "League description is required"),
    league_rules: z.string().min(1, "League rules are required"),
    categories: z
      .array(
        z.object({
          category_name: z.string().min(1, "Category name is required"),
          category_format: z.string().min(1, "Category format is required"),
          max_team: z.coerce.number().min(1, "At least 1 team is required"),
          entrance_fee_amount: z.coerce
            .number()
            .min(1, "Entrance fee must be at least ₱1"),
        })
      )
      .min(1, "At least one category is required"),
  });

export type CreateLeagueFormValues = z.infer<
  ReturnType<typeof CreateLeagueFormSchema>
>;

interface CreateLeagueFormProps {
  hasLeague: boolean;
}

export default function CreateLeagueForm({}: CreateLeagueFormProps) {
  const [categories, setCategories] = useState<CreateLeagueCategory[]>([]);
  const [content, setContent] = useState(``);

  const handleSubmit = () => {
    console.log(content);
  };

  return (
    <>
      <Label htmlFor="rules">League Description</Label>
      <MinimalTiptap
        onChange={setContent}
        placeholder="Start typing your content here..."
        className="min-h-[400px]"
      />

      <Label htmlFor="rules">Select Sportsmanship Rules</Label>
      <MultiSelect
        id="rules"
        options={StaticData.SportsmanshipRules}
        onValueChange={(values) => console.log(values)}
        placeholder="Select positions"
        maxCount={6}
      />

      <LeagueCategoryManager
        setCategories={setCategories}
        categories={categories}
      />
      <Button onClick={handleSubmit}>Submit</Button>
    </>
  );
}
