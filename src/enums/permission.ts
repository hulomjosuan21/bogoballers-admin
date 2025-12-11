export enum Permission {
  ManageLeagueAdmins = "ManageLeagueAdmins",
  ScoreGames = "ScoreGames",
  ManageTeams = "ManageTeams",
  ViewReports = "ViewReports"
}

export function getUserPermissions(accountType: string): Permission[] {
  switch (accountType) {
    case "League_Administrator_Local":
      return [
       
      ];
    case "League_Administrator_LGU":
      return [
        Permission.ManageLeagueAdmins
      ];
    default:
      return [];
  }
}
