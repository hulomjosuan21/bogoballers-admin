import ContentHeader from "@/components/content-header";
import { getAdminColumns } from "@/components/manage-league-admins/manage-league-admins-columns";
import { getLeagueColumns } from "@/components/manage-league-admins/manage-league-columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useManageLeagueAdmins } from "@/hooks/useManageLeagueAdmins";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import type { LeagueStatus } from "@/service/manageLeagueAdmins";
import { DataTable } from "@/tables/ManageLeagueAdminDataTable";
import { useMemo, useState } from "react";

const ManageLeagueAdministratorPage = () => {
  const [togglingAdminId, setTogglingAdminId] = useState<string | null>(null);
  const [updatingLeagueId, setUpdatingLeagueId] = useState<string | null>(null);

  const {
    admins,
    isLoadingAdmins,
    leagues,
    isLoadingLeagues,
    toggleAdminOperational,
    updateLeagueStatus,
  } = useManageLeagueAdmins();

  const handleToggleOperational = (adminId: string) => {
    setTogglingAdminId(adminId);
    toggleAdminOperational(adminId, {
      onSettled: () => setTogglingAdminId(null),
    });
  };

  const handleUpdateLeagueStatus = (leagueId: string, status: LeagueStatus) => {
    setUpdatingLeagueId(leagueId);
    updateLeagueStatus(
      { leagueId, status },
      {
        onSettled: () => setUpdatingLeagueId(null),
      }
    );
  };

  const adminColumns = useMemo(
    () =>
      getAdminColumns({
        onToggleOperational: handleToggleOperational,
        togglingAdminId: togglingAdminId,
      }),
    [togglingAdminId]
  );

  const leagueColumns = useMemo(
    () =>
      getLeagueColumns({
        onUpdateStatus: handleUpdateLeagueStatus,
        updatingLeagueId: updatingLeagueId,
      }),
    [updatingLeagueId]
  );

  return (
    <ContentShell>
      <ContentHeader title="Platform League Administrators and League Management dashboard" />

      <ContentBody>
        <Tabs defaultValue="admins" className="text-sm text-muted-foreground">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="admins">League Administrators</TabsTrigger>
            <TabsTrigger value="leagues">Leagues</TabsTrigger>
          </TabsList>
          <TabsContent value="admins">
            <DataTable
              columns={adminColumns}
              data={admins || []}
              isLoading={isLoadingAdmins}
              filterColumnId="organization_name"
              filterPlaceholder="Filter organizations..."
            />
          </TabsContent>
          <TabsContent value="leagues">
            <DataTable
              columns={leagueColumns}
              data={leagues || []}
              isLoading={isLoadingLeagues}
              filterColumnId="league_title"
              filterPlaceholder="Filter leagues..."
            />
          </TabsContent>
        </Tabs>
      </ContentBody>
    </ContentShell>
  );
};

export default ManageLeagueAdministratorPage;
