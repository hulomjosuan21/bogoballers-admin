/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '@g-loot/react-tournament-brackets' {
    import * as React from 'react';

    export interface Participant {
        id: string;
        resultText: string;
        isWinner: boolean;
        name: string;
        score: number;
    }

    export interface MatchProps {
        id: number;
        name: string;
        nextMatchId: number | null;
        tournamentRoundText: string;
        startTime: string;
        state: string;
        participants: Participant[];
    }

    export interface SingleEliminationBracketProps {
        matches: MatchProps[];
        matchComponent?: React.ComponentType<any>;
        matchContainerComponent?: React.ComponentType<any>;
    }

    export const SingleEliminationBracket: React.FC<SingleEliminationBracketProps>;
    export const Match: React.FC<any>;
}