import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ManageAffiliates from "./manange-affiliate";
import { useQuery } from "@tanstack/react-query";
import { getActiveLeagueResourceQueryOptions } from "@/queries/league";
import { Loader2 } from "lucide-react";

export default function LeagueAffiliatePage() {
  const { data, isLoading, error } = useQuery(
    getActiveLeagueResourceQueryOptions
  );

  return (
    <ContentShell>
      <ContentHeader title="Sponsors & Partners"></ContentHeader>

      <ContentBody>
        {isLoading ? (
          <div className="centered-container">
            <Loader2 className="spinner-primary" />
          </div>
        ) : error ? (
          <div className="centered-container">
            <p className="text-primary">{error.message}</p>
          </div>
        ) : (
          <ManageAffiliates data={data?.league_affiliates ?? []} />
        )}
      </ContentBody>
    </ContentShell>
  );
}
