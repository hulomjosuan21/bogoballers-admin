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
interface CreateSuperStaff {
  username: string;
  full_name: string;
  contact_info: string;
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
  async login(data: FormData) {
    const response = await axiosClient.post<{ message: string }>(
      `${this.base}/login`,
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
    await axiosClient.post(`${this.base}/logout`);
  }

  async checkSuperStaffStatus(leagueAdminId: string) {
    const response = await axiosClient.get<{ exists: boolean }>(
      `${this.base}/super-staff/status/${leagueAdminId}`
    );
    return response.data;
  }

  async createSuperStaff(data: CreateSuperStaff, leagueAdminId: string) {
    const response = await axiosClient.post(
      `${this.base}/super-staff/create/${leagueAdminId}`,
      data
    );
    return response.data;
  }

  async verifySuperStaff(data: { username: string; pin: string }) {
    const response = await axiosClient.post(
      `${this.base}/super-staff/verify`,
      data
    );
    return response.data;
  }

  async authStaff() {
    const response = await axiosClient.get<{ exists: boolean }>(
      "/staff/super-staff/exists"
    );

    return response.data.exists;
  }
}

export const leagueAdminStaffService = new LeagueAdminStaffService();
