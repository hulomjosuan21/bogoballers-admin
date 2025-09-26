export enum Permission {
  ViewDashboard,
  CreateLeague,
  UpdateLeague,
  ManageCategories,
  ManagePlayers,
  ManageTeams,
  ViewTeamSubmissions,
  ManageOfficialsAndCourts,
  MatchManangement,
  ManageAffiliates,
  ManageBrackets,
  ScheduleMatches,
  ViewScheduledMatches,
  ManageSettings,
  ScoreBook,
  ManagementLeagueAdmins,
  ViewChat,
}

export function getUserPermissions(accountType: string): Permission[] {
  switch (accountType) {
    case "League_Administrator_Local":
      return [
        Permission.ViewDashboard,
        Permission.CreateLeague,
        Permission.UpdateLeague,
        Permission.ManageCategories,
        Permission.MatchManangement,
        Permission.ManagePlayers,
        Permission.ManageTeams,
        Permission.ViewTeamSubmissions,
        Permission.ManageOfficialsAndCourts,
        Permission.ManageAffiliates,
        Permission.ManageBrackets,
        Permission.ScheduleMatches,
        Permission.ViewScheduledMatches,
        Permission.ManageSettings,
        Permission.ScoreBook,
        Permission.ViewChat,
      ];
    case "League_Administrator_LGU":
      return [
        Permission.ViewDashboard,
        Permission.CreateLeague,
        Permission.UpdateLeague,
        Permission.ManageCategories,
        Permission.ManagePlayers,
        Permission.MatchManangement,
        Permission.ManageTeams,
        Permission.ViewTeamSubmissions,
        Permission.ManageOfficialsAndCourts,
        Permission.ManageAffiliates,
        Permission.ManageBrackets,
        Permission.ScheduleMatches,
        Permission.ViewScheduledMatches,
        Permission.ManageSettings,
        Permission.ManagementLeagueAdmins,
        Permission.ScoreBook,
        Permission.ViewChat,
      ];
    default:
      return [];
  }
}
