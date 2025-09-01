import barangay from "./jsons/barangays.json";
import orgTypes from "./jsons/org-types.json";
import listOfCatogories from "./jsons/league_categories.json";
import sportsmanshipRules from "./jsons/sportsmanship_rules.json";
import uniqueleagueOfficial from "./jsons/league_unique_officials.json";
import multiLeagueOfficial from "./jsons/league_multi_officials.json";
import playerValidationDocuments from "./jsons/player_validation_documents.json";
export type Barangay = (typeof barangay)[number];
export type OrganizationType = (typeof orgTypes)[number];
export type ListOfCatogoriesType = (typeof listOfCatogories)[number];
export type SportsmanshipRules = (typeof sportsmanshipRules)[number];
export type UniqueLeagueOfficial = (typeof uniqueleagueOfficial)[number];
export type MultiLeagueOfficial = (typeof multiLeagueOfficial)[number];
export type PlayerValidationDocument =
  (typeof playerValidationDocuments)[number];

export const StaticData: {
  Barangays: Barangay[];
  OrganizationTypes: OrganizationType[];
  ListOfCategories: ListOfCatogoriesType[];
  SportsmanshipRules: SportsmanshipRules[];
  UniqueLeagueRoleOfficials: UniqueLeagueOfficial[];
  MultiLeagueRoleOfficials: MultiLeagueOfficial[];
  PlayerValidationDocuments: PlayerValidationDocument[];
} = {
  Barangays: barangay,
  OrganizationTypes: orgTypes,
  ListOfCategories: listOfCatogories,
  SportsmanshipRules: sportsmanshipRules,
  UniqueLeagueRoleOfficials: uniqueleagueOfficial,
  MultiLeagueRoleOfficials: multiLeagueOfficial,
  PlayerValidationDocuments: playerValidationDocuments,
};
