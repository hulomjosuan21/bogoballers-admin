import ContentHeader from "@/components/content-header";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getActiveLeagueQueryOptions } from "@/queries/league";
import { Loader2 } from "lucide-react";
import { TeamSubmissionTable } from "./table";

export default function TeamSubmissionPage() {
  const {
    data: activeLeague,
    isLoading,
    error,
  } = useQuery(getActiveLeagueQueryOptions);

  return (
    <ContentShell>
      <ContentHeader title="Team Submission"></ContentHeader>

      <ContentBody>
        {isLoading ? (
          <div className="centered-container">
            <Loader2 className="spinner-primary" />
          </div>
        ) : error ? (
          <div className="centered-container">
            <p className="text-primary">{error.message}</p>
          </div>
        ) : activeLeague?.categories && activeLeague.categories.length > 0 ? (
          <Tabs defaultValue={activeLeague.categories[0].category_id}>
            <TabsList>
              {activeLeague.categories.map((category) => (
                <TabsTrigger
                  key={category.category_id}
                  value={category.category_id}
                >
                  {category.category_name}
                </TabsTrigger>
              ))}
            </TabsList>

            {activeLeague.categories.map((category) => (
              <TabsContent
                key={category.category_id}
                value={category.category_id}
              >
                <TeamSubmissionTable />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="centered-container">
            <p className="text-muted-foreground">No data</p>
          </div>
        )}
      </ContentBody>
    </ContentShell>
  );
}
