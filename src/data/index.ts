import barangay from "./barangays.json"
import orgTypes from "./org-types.json"

export type Barangay = (typeof barangay)[number]
export type OrganizationType = (typeof orgTypes)[number]

export const StaticData: {
    Barangays: Barangay[]
    OrganizationTypes: OrganizationType[]
} = {
    Barangays: barangay,
    OrganizationTypes: orgTypes,
}
