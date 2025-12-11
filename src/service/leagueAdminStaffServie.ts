import axiosClient from "@/lib/axiosClient";
export interface Staff {
  staff_id: string;
  username: string;
  role_label: string;
  permissions: string[];
  staff_created_at: string;
  full_name: string;
  contact_info: string;
}
interface CreateStaff {
  username: string;
  full_name: string;
  contact_info: string;
  role_label: string;
  permissions: string[];
  pin: string;
}

interface LoginStaff {
  username: string;
  pin: string;
}

class LeagueAdminStaffService {
  readonly base: string = "/league-staff";

  async getAll(leagueAdminId: string) {
    const response = await axiosClient.get<Staff[]>(
      `${this.base}/all/${leagueAdminId}`
    );
    return response.data;
  }

  async register(data: CreateStaff, leagueAdminId: string) {
    const response = await axiosClient.post<{ message: string }>(
      `${this.base}/register/${leagueAdminId}`,
      data
    );
    return response.data;
  }
  async login(data: LoginStaff) {
    const response = await axiosClient.post(
      `${this.base}/league-staff/login`,
      data
    );
    return response.data;
  }

  async update(staffId: string, data: Partial<CreateStaff>) {
    const response = await axiosClient.put(
      `${this.base}/update/${staffId}`,
      data
    );
    return response.data;
  }

  async delete(staffId: string) {
    const response = await axiosClient.delete(`${this.base}/delete/${staffId}`);
    return response.data;
  }
  async logout() {
    await axiosClient.post(`${this.base}/league-staff/logout`);
  }
}

export const leagueAdminStaffService = new LeagueAdminStaffService();
