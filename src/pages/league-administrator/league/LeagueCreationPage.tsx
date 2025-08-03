import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import CreateLeagueForm from "./create-components/create-league-form";

export default function LeagueCreationPage() {
  return (
    <ContentShell>
      <ContentHeader title="Start new League"></ContentHeader>

      <ContentBody>
        <CreateLeagueForm hasLeague={false} />
      </ContentBody>
    </ContentShell>
  );
}
