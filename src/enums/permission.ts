export enum Permission {
  invite_player,
}

export function userPermission(accountType: string): Permission[] {
  switch (accountType) {
    case "League_Administrator_Local":
      return [Permission.invite_player];
    case "League_Administrator_LGU":
      return [Permission.invite_player];
    default:
      return [];
  }
}
