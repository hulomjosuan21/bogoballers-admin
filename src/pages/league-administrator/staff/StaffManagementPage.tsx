import { useQuery } from "@tanstack/react-query";
import { columns } from "./_components/columns";
import { Loader2 } from "lucide-react";
import { leagueAdminStaffService } from "@/service/leagueAdminStaffService";
import { StaffDataTable } from "./_components/table";
import { ContentBody, ContentShell } from "@/layouts/ContentShell";
import ContentHeader from "@/components/content-header";
import { useAuthLeagueAdmin } from "@/hooks/useAuth";

export default function StaffManagementPage() {
  const { leagueAdminId } = useAuthLeagueAdmin();

  const {
    data: staffList,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["league-staff"],
    queryFn: async () => await leagueAdminStaffService.getAll(leagueAdminId!),
    enabled: Boolean(leagueAdminId),
  });

  return (
    <ContentShell>
      <ContentHeader title="Staff Management" />
      <ContentBody>
        {isLoading ? (
          <div className="flex h-[200px] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-red-500">Failed to load staff data.</div>
        ) : (
          <StaffDataTable
            columns={columns}
            data={staffList || []}
            filterColumn="username"
            refresh={refetch}
          />
        )}
      </ContentBody>
    </ContentShell>
  );
}
