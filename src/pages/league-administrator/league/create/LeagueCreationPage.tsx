import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import CreateLeagueForm from "./form";
import { SmallButton } from "@/components/custom-buttons";
import { Info } from "lucide-react";

export default function LeagueCreationPage() {
  return (
    <ContentShell>
      <ContentHeader title="Start new League">
        <SmallButton variant={"ghost"}>
          <Info />
        </SmallButton>
      </ContentHeader>

      <ContentBody>
        <CreateLeagueForm />
      </ContentBody>
    </ContentShell>
  );
}
