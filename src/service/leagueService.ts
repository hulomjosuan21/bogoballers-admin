import type {
  LeagueType,
  LeagueAffiliate,
  LeagueCourt,
  LeagueOfficial,
  LeagueOption,
  LeagueReferee,
  LeagueResource,
  LeagueAnalytics,
} from "@/types/league";
import { ApiResponse } from "../lib/apiResponse";
import axiosClient from "@/lib/axiosClient";
import type { LeagueCreateOfficialCreate } from "@/tables/ManageOfficialsTable";
import type { LeagueRefereeCreate } from "@/tables/ManageRefereesTable";
import type { LeagueAffiliateCreate } from "@/tables/ManangeAffiliateTable";

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
export class LeagueService {
  static async analytics(leagueId: string) {
    const res = await axiosClient.get<LeagueAnalytics>(
      `/league/analytics/${leagueId}`
    );

    return res.data;
  }

  static async updateOption({
    leagueId,
    data,
  }: {
    leagueId: string;
    data: Partial<LeagueOption>;
  }) {
    const res = await axiosClient.put(`/league/${leagueId}/option`, {
      option: data,
    });

    return ApiResponse.fromJsonNoPayload(res.data);
  }

  static async exportLeaguePDF(leagueId: string) {
    const res = await axiosClient.get(`/league/${leagueId}/export-pdf`, {
      responseType: "blob",
    });

    const blob = res.data as Blob;
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `league_${leagueId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
  }

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
    const response = await axiosClient.post<{ message: string }>(
      "/league/create-new",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );
    return response.data;
  }

  static async fetchActiveLeague(): Promise<LeagueType | null> {
    const response = await axiosClient.get<LeagueType>("/league/active");

    if (!response.data || Object.keys(response.data).length === 0) {
      return null;
    }

    return response.data;
  }

  static async fetchActiveLeagueResource(): Promise<LeagueResource | null> {
    const response = await axiosClient.get<LeagueResource>(
      "/league/active?resource=true"
    );

    if (!response.data || Object.keys(response.data).length === 0) {
      return null;
    }

    return response.data;
  }

  static async updateCurrent(leagueId: string, formData: FormData) {
    const response = await axiosClient.put<{ message: string }>(
      `/league/update/${leagueId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );

    return response.data;
  }
}
