import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import CreateLeagueForm from "@/forms/LeagueCreationForm";
import { RiSpamFill } from "@remixicon/react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LeagueService } from "@/service/leagueService";
import { useQuery } from "@tanstack/react-query";

export default function CreateLeaguePage() {
  const { data, refetch } = useQuery({
    queryKey: ["active-league-data"],
    queryFn: () => LeagueService.fetchActive(),
    enabled: true,
    retry: 1,
  });

  return (
    <ContentShell>
      <ContentHeader title="Create League" />

      <ContentBody>
        {data && (
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
        <CreateLeagueForm hasActive={!!data} refetch={refetch} />
      </ContentBody>
    </ContentShell>
  );
}
