import axiosClient from "@/lib/axiosClient";

interface CreateCategoryRoundPayload {
  categoryId: string;
  roundId: string;
  roundName: string;
  roundStatus: string;
  roundFormat: string | null;
  roundOrder: number;
  position: { x: number; y: number };
}

interface CreateRoundFormatPayload {
  roundId: string;
  formatType: string;
  pairingMethod?: string;
  position: { x: number; y: number };
}

export class LeagueCategoryService {
  static async createCategoryRound({
    categoryId,
    roundId,
    roundName,
    roundStatus,
    position,
  }: CreateCategoryRoundPayload) {
    await axiosClient.post(`/league/category/${categoryId}/add-round`, {
      round_id: roundId,
      round_name: roundName,
      round_status: roundStatus,
      position,
    });
  }

  static async updateRoundPosition({
    categoryId,
    roundId,
    position,
  }: {
    categoryId: string;
    roundId: string;
    position: { x: number; y: number };
  }) {
    await axiosClient.post(
      `/league/category/${categoryId}/round/${roundId}/update-position`,
      {
        position,
      }
    );
  }

  static async createRoundFormat({
    roundId,
    formatType,
    pairingMethod,
    position,
  }: CreateRoundFormatPayload) {
    await axiosClient.post(`/league/round/${roundId}/add-format`, {
      round_id: roundId,
      format_type: formatType,
      pairing_method: pairingMethod ?? "default",
      position,
    });
  }

  static async updateFormatPosition({
    roundId,
    position,
  }: {
    roundId: string;
    position: { x: number; y: number };
  }) {
    await axiosClient.post(`/league/round/${roundId}/update-format-position`, {
      position,
    });
  }
}
