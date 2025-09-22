import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import LeagueAdministatorDataGrid from "@/tables/LeagueAdministratorDataGrid";

const LeagueAdminPagesLGU = () => {
  return (
    <ContentShell>
      <ContentHeader title="Manage League Administrators" />
      <ContentBody>
        <LeagueAdministatorDataGrid />
      </ContentBody>
    </ContentShell>
  );
};

export default LeagueAdminPagesLGU;
