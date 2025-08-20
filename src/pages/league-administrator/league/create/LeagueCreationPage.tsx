import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import CreateLeagueForm from "./form";
import { SmallButton } from "@/components/custom-buttons";
import { Info } from "lucide-react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
} from "@/components/ui/alert";
import { RiSpamFill } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getActiveLeagueQueryOptions } from "@/queries/league";
export default function LeagueCreationPage() {
  const { data: activeLeague } = useQuery(getActiveLeagueQueryOptions);
  return (
    <ContentShell>
      <ContentHeader title="Start new League">
        <SmallButton variant={"ghost"}>
          <Info />
        </SmallButton>
      </ContentHeader>

      <ContentBody>
        {activeLeague && (
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
              >
                Learn more
              </Button>
            </AlertToolbar>
          </Alert>
        )}
        <CreateLeagueForm hasActive={!!activeLeague} />
      </ContentBody>
    </ContentShell>
  );
}
