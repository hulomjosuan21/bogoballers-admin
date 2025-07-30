import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";

export default function AnalyticsPage() {
  return (
    <ContentShell>
      <ContentHeader title="Analytics">
      </ContentHeader>

      <ContentBody className="grid place-content-center">
        Analytics
      </ContentBody>
    </ContentShell>
  );
}