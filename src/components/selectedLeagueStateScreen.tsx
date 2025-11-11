import type { LeagueStatus } from "@/service/leagueService";
import type { League } from "@/types/league";
import { Loader2 } from "lucide-react";
import { Spinner } from "./ui/spinner";

const SelectedLeagueStateScreen = ({
  state,
  league,
  loading,
}: {
  state?: LeagueStatus;
  league?: League;
  loading?: boolean;
  isError?: boolean;
  error?: Error | null;
}) => {
  // --- Loading State ---
  // This state is simple and can return early.
  if (loading) {
    return (
      <div className="h-screen w-full grid place-items-center">
        <Spinner />
      </div>
    );
  }

  // --- Content Switching ---
  // We define the content for each state first,
  // then render it inside a common layout wrapper.
  let content: React.ReactNode;

  switch (state) {
    case "Pending":
      content = (
        <>
          <span className="text-lg font-semibold">
            {league?.league_title ?? "League"} is Under Review
          </span>
          <span className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Pending Approval
          </span>
        </>
      );
      break;

    case "Scheduled":
      content = (
        <>
          <span className="text-lg font-semibold">
            {league?.league_title} is Scheduled
          </span>
          <span className="text-sm text-muted-foreground">
            Matches not started yet.
          </span>
        </>
      );
      break;

    case "Ongoing":
      content = (
        <>
          <span className="text-lg font-semibold">
            {league?.league_title} is Live {/* Fixed typo "is is Live" */}
          </span>
          <span className="text-sm text-muted-foreground">
            Matches are currently ongoing.
          </span>
        </>
      );
      break;

    case "Completed":
      content = (
        <>
          <span className="text-lg font-semibold">
            {league?.league_title} is Completed already
          </span>
          <span className="text-sm text-muted-foreground">
            All matches are finalized.
          </span>
        </>
      );
      break;

    case "Postponed":
      content = (
        <>
          <span className="text-lg font-semibold">
            {league?.league_title} is Postponed
          </span>
          <span className="text-sm text-muted-foreground">
            Await further updates.
          </span>
        </>
      );
      break;

    case "Cancelled":
      content = (
        <>
          <span className="text-lg font-semibold">
            {league?.league_title} is Cancelled
          </span>
          <span className="text-sm text-muted-foreground">
            No further schedules.
          </span>
        </>
      );
      break;

    default:
      content = (
        <>
          <span className="text-lg font-semibold">No League Selected</span>
          <span className="text-sm text-muted-foreground">
            Select a league to continue.
          </span>
        </>
      );
  }

  return (
    <div className="h-screen w-full grid place-items-center px-4">
      {/* This inner div stacks the text, centers it, and adds a consistent gap. */}
      <div className="flex flex-col items-center text-center gap-2">
        {content}
      </div>
    </div>
  );
};

export default SelectedLeagueStateScreen;
