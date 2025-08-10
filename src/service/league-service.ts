import type {
  League,
  LeagueAffiliate,
  LeagueCourt,
  LeagueOfficial,
  LeagueReferee,
  LeagueResource,
} from "@/types/league";
import { ApiResponse } from "./../lib/apiResponse";
import axiosClient from "@/lib/axiosClient";
import type { LeagueCreateOfficialCreate } from "@/pages/league-administrator/manage/manage-officials";
import type { LeagueRefereeCreate } from "@/pages/league-administrator/manage/manage-referees";
import type { LeagueAffiliateCreate } from "@/pages/league-administrator/manage/manange-affiliate";

type FieldKeyMap = {
  league_courts: LeagueCourt;
  league_officials: LeagueOfficial | LeagueCreateOfficialCreate;
  league_referees: LeagueReferee | LeagueRefereeCreate;
  league_affiliates: LeagueAffiliate | LeagueAffiliateCreate;
};

type ImageKeyMap = {
  [K in keyof FieldKeyMap]: keyof FieldKeyMap[K] | null;
};

const IMAGE_KEY_MAP: ImageKeyMap = {
  league_courts: null,
  league_officials: "photo",
  league_referees: "photo",
  league_affiliates: "image",
};

export default class LeagueService {
  static async updateSingleLeagueResourceField<K extends keyof FieldKeyMap>(
    league_id: string,
    field: K,
    list: FieldKeyMap[K][]
  ) {
    const imageKey = IMAGE_KEY_MAP[field];

    const formData = new FormData();

    formData.append(
      field,
      JSON.stringify(
        list.map((o) => ({
          ...o,
          ...(imageKey && o[imageKey] instanceof File
            ? { [imageKey]: null }
            : {}),
        }))
      )
    );

    if (imageKey) {
      list.forEach((o, idx) => {
        const file = o[imageKey];
        if (file instanceof File) {
          formData.append(`${field}_file_${idx}`, file);
        }
      });
    }

    const response = await axiosClient.put(
      `/league/${league_id}/update-field/${field}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return ApiResponse.fromJsonNoPayload(response.data);
  }

  static async createNewLeague(formData: FormData) {
    const response = await axiosClient.post("/league/create-new", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return ApiResponse.fromJsonNoPayload(response.data);
  }

  static async fetchActiveLeague(): Promise<League | null> {
    const response = await axiosClient.get("/league/active");

    if (!response.data || Object.keys(response.data).length === 0) {
      return null;
    }

    return response.data as League;
  }

  static async fetchActiveLeagueResource(): Promise<LeagueResource | null> {
    const response = await axiosClient.get("/league/active?resource=true");

    if (!response.data || Object.keys(response.data).length === 0) {
      return null;
    }

    return response.data as LeagueResource;
  }
}
