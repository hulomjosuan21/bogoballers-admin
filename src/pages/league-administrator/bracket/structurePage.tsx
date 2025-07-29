import { SingleEliminationBracket, Match } from '@g-loot/react-tournament-brackets';
import { useMemo } from "react";

export default function BracketStructurePage() {
    const openLeagueMatches = useMemo(
        () => [
            {
                id: 1,
                name: "Match 1",
                nextMatchId: 3,
                tournamentRoundText: "Elimination",
                startTime: "2025-07-25",
                state: "SCORE_DONE",
                participants: [
                    {
                        id: "1",
                        resultText: "75",
                        isWinner: true,
                        name: "Team Alpha",
                        score: 75,
                    },
                    {
                        id: "2",
                        resultText: "68",
                        isWinner: false,
                        name: "Team Beta",
                        score: 68,
                    },
                ],
            },
            {
                id: 2,
                name: "Match 2",
                nextMatchId: 3,
                tournamentRoundText: "Elimination",
                startTime: "2025-07-25",
                state: "SCORE_DONE",
                participants: [
                    {
                        id: "3",
                        resultText: "60",
                        isWinner: false,
                        name: "Team Gamma",
                        score: 60,
                    },
                    {
                        id: "4",
                        resultText: "72",
                        isWinner: true,
                        name: "Team Delta",
                        score: 72,
                    },
                ],
            },
            {
                id: 3,
                name: "Semi Final",
                nextMatchId: null,
                tournamentRoundText: "Semi Finals",
                startTime: "2025-07-28",
                state: "SCORE_DONE",
                participants: [
                    {
                        id: "1",
                        resultText: "80",
                        isWinner: true,
                        name: "Team Alpha",
                        score: 80,
                    },
                    {
                        id: "4",
                        resultText: "77",
                        isWinner: false,
                        name: "Team Delta",
                        score: 77,
                    },
                ],
            },
        ],
        []
    );

    const midgetMatches = useMemo(
        () => [
            {
                id: 4,
                name: "Match 1",
                nextMatchId: 6,
                tournamentRoundText: "Elimination",
                startTime: "2025-07-25",
                state: "SCORE_DONE",
                participants: [
                    {
                        id: "10",
                        resultText: "55",
                        isWinner: true,
                        name: "Team Tigers",
                        score: 55,
                    },
                    {
                        id: "11",
                        resultText: "43",
                        isWinner: false,
                        name: "Team Cubs",
                        score: 43,
                    },
                ],
            },
            {
                id: 5,
                name: "Match 2",
                nextMatchId: 6,
                tournamentRoundText: "Elimination",
                startTime: "2025-07-25",
                state: "SCORE_DONE",
                participants: [
                    {
                        id: "12",
                        resultText: "49",
                        isWinner: false,
                        name: "Team Foxes",
                        score: 49,
                    },
                    {
                        id: "13",
                        resultText: "61",
                        isWinner: true,
                        name: "Team Wolves",
                        score: 61,
                    },
                ],
            },
            {
                id: 6,
                name: "Semi Final",
                nextMatchId: null,
                tournamentRoundText: "Semi Finals",
                startTime: "2025-07-28",
                state: "SCORE_DONE",
                participants: [
                    {
                        id: "10",
                        resultText: "58",
                        isWinner: false,
                        name: "Team Tigers",
                        score: 58,
                    },
                    {
                        id: "13",
                        resultText: "64",
                        isWinner: true,
                        name: "Team Wolves",
                        score: 64,
                    },
                ],
            },
        ],
        []
    );

    return (
        <div className="space-y-16 px-4 py-8">
            <section>
                <h2 className="text-2xl font-bold mb-4 text-center">Open League Men</h2>
                <SingleEliminationBracket
                    matches={openLeagueMatches}
                    matchComponent={Match}
                />
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4 text-center">13-Under Midget</h2>
                <SingleEliminationBracket
                    matches={midgetMatches}
                    matchComponent={Match}
                />
            </section>
        </div>
    );
}
