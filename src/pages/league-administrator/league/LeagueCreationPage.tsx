import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";

export default function LeagueCreationPage() {
  return (
    <ContentShell>
      <ContentHeader title="Start new League">
      </ContentHeader>

      <ContentBody className="grid place-content-center">
        New League
      </ContentBody>
    </ContentShell>
  );
}