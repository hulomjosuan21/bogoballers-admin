import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";

import ManageOfficials from "./manage-officials";
import ManangeReferees from "./manage-referees";

export default function LeagueOfficialsPage() {
  return (
    <ContentShell>
      <ContentHeader title="League Officials" />

      <ContentBody className="">
        <ManageOfficials />
        <ManangeReferees />
      </ContentBody>
    </ContentShell>
  );
}
