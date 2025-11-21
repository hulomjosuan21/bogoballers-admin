export interface LeagueLog {
  id: string;
  action: string;
  message: string;
  meta: Record<string, any>;
  created_at: string;
}
