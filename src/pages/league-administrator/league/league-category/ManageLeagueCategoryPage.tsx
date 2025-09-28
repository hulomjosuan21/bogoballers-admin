import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { LeagueCategoriesTable } from "@/tables/LeagueCategoriesTable";

export default function ManageLeagueCategoriesPage() {
  return (
    <ContentShell>
      <ContentHeader title="Manage League Categories" />
      <ContentBody>
        <LeagueCategoriesTable />
      </ContentBody>
    </ContentShell>
  );
}
