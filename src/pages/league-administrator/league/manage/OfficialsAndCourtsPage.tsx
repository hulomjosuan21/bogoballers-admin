import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";

import ManageOfficials from "./manage-officials";
import ManangeReferees from "./manage-referees";
import ManageCourts from "./manage-courts";
import { useQuery } from "@tanstack/react-query";
import { getActiveLeagueResourceQueryOptions } from "@/queries/league";
import { Loader2 } from "lucide-react";

export default function LeagueOfficialsPage() {
  const { data, isLoading, error } = useQuery(
    getActiveLeagueResourceQueryOptions
  );

  return (
    <ContentShell>
      <ContentHeader title="League Officials" />

      <ContentBody className="">
        {isLoading ? (
          <div className="centered-container">
            <Loader2 className="spinner-primary" />
          </div>
        ) : error ? (
          <div className="centered-container">
            <p className="text-primary">{error.message}</p>
          </div>
        ) : (
          <>
            <ManageOfficials data={data?.league_officials ?? []} />
            <ManangeReferees data={data?.league_referees ?? []} />
            <ManageCourts data={data?.league_courts ?? []} />
          </>
        )}
      </ContentBody>
    </ContentShell>
  );
}
