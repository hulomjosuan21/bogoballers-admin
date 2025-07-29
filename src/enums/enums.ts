export const AccountTypeEnum = {
    PLAYER: "Player",
    TEAM_CREATOR: "Team_Creator",
    LOCAL_ADMINISTRATOR: "League_Administrator_Local",
    LGU_ADMINISTRATOR: "League_Administrator_LGU",
    SYSTEM: "System",
} as const

export type AccountTypeEnum = (typeof AccountTypeEnum)[keyof typeof AccountTypeEnum]
