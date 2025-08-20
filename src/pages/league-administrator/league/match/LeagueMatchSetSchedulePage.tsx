import ContentHeader from "@/components/content-header";
import EventCalendar from "@/components/event-calendar";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";

export default function LeagueMatchSetUnSchedulePage() {
  return (
    <ContentShell>
      <ContentHeader title="Set Schedule"></ContentHeader>

      <ContentBody>
        <EventCalendar initialEvents={[]} isPublic />
      </ContentBody>
    </ContentShell>
  );
}
