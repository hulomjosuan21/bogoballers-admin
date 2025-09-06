import axiosClient from "@/lib/axiosClient";
import type { QueryResultWrapper } from "@/types/searchResults";

export class SearchService {
  static async searchEntity(query: string): Promise<QueryResultWrapper> {
    const response = await axiosClient.post<QueryResultWrapper>(
      "/entity/search",
      { query }
    );
    return response.data;
  }
}
