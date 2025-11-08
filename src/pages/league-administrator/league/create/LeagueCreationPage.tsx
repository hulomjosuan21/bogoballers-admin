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
import { useFetchLeagueGenericData } from "@/hooks/useFetchLeagueGenericData";
import type { League } from "@/types/league";

export default function CreateLeaguePage() {
  const { hasData } = useFetchLeagueGenericData<League>({
    params: { active: true, filter: "Check" },
  });

  return (
    <ContentShell>
      <ContentHeader title="Create League" />

      <ContentBody>
        {hasData && (
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
        <CreateLeagueForm hasActive={hasData} />
      </ContentBody>
    </ContentShell>
  );
}
