import axiosClient from "@/lib/axiosClient";

class SchedulerService {
  readonly base: string = "/scheduler";
  async monitorMatchSchedule(leagueMatchId: string) {
    const response = await axiosClient.post<{ message: string }>(
      `${this.base}/monitor-match/${leagueMatchId}`
    );

    return response.data;
  }
}

const schedulerService = new SchedulerService();

export default schedulerService;
