import barangay from "./jsons/barangays.json";
import orgTypes from "./jsons/org-types.json";
import listOfCatogories from "./jsons/league_categories.json";
import sportsmanshipRules from "./jsons/sportsmanship_rules.json";
export type Barangay = (typeof barangay)[number];
export type OrganizationType = (typeof orgTypes)[number];
export type ListOfCatogoriesType = (typeof listOfCatogories)[number];
export type SportsmanshipRules = (typeof sportsmanshipRules)[number];

export const StaticData: {
  Barangays: Barangay[];
  OrganizationTypes: OrganizationType[];
  ListOfCategories: ListOfCatogoriesType[];
  SportsmanshipRules: SportsmanshipRules[];
} = {
  Barangays: barangay,
  OrganizationTypes: orgTypes,
  ListOfCategories: listOfCatogories,
  SportsmanshipRules: sportsmanshipRules,
};
