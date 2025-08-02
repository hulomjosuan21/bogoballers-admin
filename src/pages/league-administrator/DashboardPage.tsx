import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";

export default function DashboardPage() {
    return (
        <ContentShell>
            <ContentHeader title="Dashboard">
            </ContentHeader>

            <ContentBody className="grid place-content-center">
            </ContentBody>
        </ContentShell>
    )
}
