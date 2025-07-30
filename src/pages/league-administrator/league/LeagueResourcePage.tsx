import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";

export default function LeagueResourcePage() {
  return (
    <ContentShell>
      <ContentHeader title="Resource">
      </ContentHeader>

      <ContentBody className="grid place-content-center">
        Resource
      </ContentBody>
    </ContentShell>
  );
}