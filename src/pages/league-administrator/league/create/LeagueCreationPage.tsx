import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import CreateLeagueForm from "./form";

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
