export interface Participant {
    id: string;
    name: string;
    isWinner: boolean;
    score: number;
    resultText: string;
}

export interface Match {
    id: number;
    name: string;
    nextMatchId: number | null;
    tournamentRoundText: string;
    startTime: string;
    state: "SCORE_DONE" | "SCHEDULED" | "RUNNING";
    participants: Participant[];
}
