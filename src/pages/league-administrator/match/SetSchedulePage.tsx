import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";

export default function SetSchedulePage() {
  return (
    <ContentShell>
      <ContentHeader title="Set Schedule">
      </ContentHeader>

      <ContentBody className="grid place-content-center">
        Set Schedule
      </ContentBody>
    </ContentShell>
  );
}