export enum Permission {
  ViewDashboard,
  CreateLeague,
  UpdateLeague,
  ManageCategories,
  ManagePlayers,
  ManageTeams,
  ViewTeamSubmissions,
  ManageOfficialsAndCourts,
  ManageAffiliates,
  ManageBrackets,
  ScheduleMatches,
  ViewScheduledMatches,
  ManageSettings,
  ScoreBook,
  ViewLeagueAdmins,
}

export function getUserPermissions(accountType: string): Permission[] {
  switch (accountType) {
    case "League_Administrator_Local":
      return [
        Permission.ViewDashboard,
        Permission.CreateLeague,
        Permission.UpdateLeague,
        Permission.ManageCategories,
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
      ];
    case "League_Administrator_LGU":
      return [
        Permission.ViewDashboard,
        Permission.CreateLeague,
        Permission.UpdateLeague,
        Permission.ManageCategories,
        Permission.ManagePlayers,
        Permission.ManageTeams,
        Permission.ViewTeamSubmissions,
        Permission.ManageOfficialsAndCourts,
        Permission.ManageAffiliates,
        Permission.ManageBrackets,
        Permission.ScheduleMatches,
        Permission.ViewScheduledMatches,
        Permission.ManageSettings,
        Permission.ViewLeagueAdmins,
        Permission.ScoreBook,
      ];
    default:
      return [];
  }
}
