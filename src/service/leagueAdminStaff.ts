import axiosClient from "@/lib/axiosClient"

interface CreateStaff {
    username: string;
    role_label: string;
    permissions: string;
}

interface LoginStaff {
    username: string;
    pin: string;
}

class LeagueAdminStaffService {
    readonly base: string = '/league-staff'
    async register(data: CreateStaff, leagueAdminId: string) {
        const response = axiosClient.post(`${this.base}/register/${leagueAdminId}`,data)
    }
    async login(data: LoginStaff) {
        const response = axiosClient.post(`${this.base}/league-staff/login`,data)
    }
    async logout() {
        const response = axiosClient.post(`${this.base}/league-staff/logout`)
    }
}

export const leagueAdminStaffService = new LeagueAdminStaffService()