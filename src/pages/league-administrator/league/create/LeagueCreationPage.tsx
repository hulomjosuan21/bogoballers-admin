import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import CreateLeagueForm from "@/forms/LeagueCreationForm";
import { Info } from "lucide-react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
} from "@/components/ui/alert";
import { RiSpamFill } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { useActiveLeague } from "@/hooks/useActiveLeague";
export default function LeagueCreationPage() {
  const { activeLeagueData, activeLeagueLoading } = useActiveLeague();

  const hasActiveLeague = useMemo(() => {
    return activeLeagueData != null && Object.keys(activeLeagueData).length > 0;
  }, [activeLeagueData]);

  return (
    <ContentShell>
      <ContentHeader title="Start new League">
        <Button variant={"ghost"} size={"sm"}>
          <Info />
        </Button>
      </ContentHeader>

      <ContentBody>
        {hasActiveLeague && (
          <Alert variant="info">
            <AlertIcon>
              <RiSpamFill />
            </AlertIcon>
            <AlertTitle>
              You cannot create a new league until the current one is finished
              or canceled.
            </AlertTitle>
            <AlertToolbar>
              <Button
                variant="inverse"
                mode="link"
                underlined="solid"
                size="sm"
                className="flex mt-0.5"
                onClick={() =>
                  window.open("/about/league", "_blank", "noopener,noreferrer")
                }
              >
                Learn more
              </Button>
            </AlertToolbar>
          </Alert>
        )}
        {!activeLeagueLoading && (
          <CreateLeagueForm hasActive={hasActiveLeague} />
        )}
      </ContentBody>
    </ContentShell>
  );
}
