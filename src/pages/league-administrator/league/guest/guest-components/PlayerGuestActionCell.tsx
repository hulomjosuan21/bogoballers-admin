import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  MoreVertical,
  Check,
  X,
  FileText,
  DollarSign,
  Undo2,
  Trash2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useLeagueGuestOperations } from "@/hooks/useLeagueGuestOperations";
import axiosClient from "@/lib/axiosClient";
import { getErrorMessage } from "@/lib/error";
import type { GuestRegistrationRequest } from "@/types/guest";
import type { Player } from "@/types/player";
import { GuestRefundDialog } from "./GuestRefundDialog";

function useLeagueTeams(leagueCategoryId: string) {
  return useQuery({
    queryKey: ["activeTeams", leagueCategoryId],
    queryFn: async () => {
      const res = await axiosClient.get<
        { team_id: string; team_name: string }[]
      >(`/league-guest/team-options/${leagueCategoryId}`);
      return res.data;
    },
    enabled: !!leagueCategoryId,
  });
}

export function PlayerGuestActionCell({
  request,
  categoryId,
}: {
  request: GuestRegistrationRequest;
  categoryId: string;
}) {
  const { updateMutation, deleteMutation, refundMutation } =
    useLeagueGuestOperations(categoryId);
  const { data: teams, isLoading: isLoadingTeams } = useLeagueTeams(categoryId);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [refundParams, setRefundParams] = useState({
    remove: false,
    title: "",
  });

  const handleAccept = async () => {
    if (!selectedTeamId) return toast.error("Please select a team.");

    toast.promise(
      updateMutation.mutateAsync({
        id: request.guest_request_id,
        status: "Accepted",
        assign_to_team_id: selectedTeamId,
      }),
      {
        loading: "Assigning player...",
        success: "Player accepted and assigned!",
        error: (e) => getErrorMessage(e),
      }
    );
    setIsAssignOpen(false);
  };

  const handleReject = () => {
    if (confirm("Reject and remove this player request?")) {
      deleteMutation.mutate(request.guest_request_id);
    }
  };

  const handlePayment = (status: string) => {
    updateMutation.mutate({
      id: request.guest_request_id,
      payment_status: status,
    });
  };

  const handleRefund = (amount: number) => {
    refundMutation.mutate({
      guest_request_id: request.guest_request_id,
      amount,
      remove: refundParams.remove,
    });
    setIsRefundOpen(false);
  };

  const documents = (request.details as Player).valid_documents || [];
  const openWindow = (url: string) =>
    window.open(url, "_blank", "width=800,height=800");

  return (
    <>
      {/* Team Select Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Team</DialogTitle>
            <DialogDescription>
              Select the team this guest player will join.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Team</Label>
            <Select onValueChange={setSelectedTeamId}>
              <SelectTrigger className="mt-2">
                <SelectValue
                  placeholder={isLoadingTeams ? "Loading..." : "Select Team"}
                />
              </SelectTrigger>
              <SelectContent>
                {teams?.map((t) => (
                  <SelectItem key={t.team_id} value={t.team_id}>
                    {t.team_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAccept} disabled={!selectedTeamId}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GuestRefundDialog
        isOpen={isRefundOpen}
        onClose={() => setIsRefundOpen(false)}
        onSubmit={handleRefund}
        title={refundParams.title}
        initialAmount={request.amount_paid}
      />

      {/* Actions Menu */}
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Player Actions</DropdownMenuLabel>

            {request.status === "Pending" && (
              <>
                <DropdownMenuItem
                  onClick={() => setIsAssignOpen(true)}
                  className="text-green-600"
                >
                  <Check className="mr-2 h-4 w-4" /> Accept & Assign
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleReject}
                  className="text-red-600"
                >
                  <X className="mr-2 h-4 w-4" /> Reject
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {/* Documents */}
            {documents.length > 0 && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <FileText className="mr-2 h-4 w-4" /> Documents
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {documents.map((doc, i) => (
                    <DropdownMenuItem
                      key={i}
                      onClick={() =>
                        openWindow(
                          Array.isArray(doc.document_urls)
                            ? doc.document_urls[0]
                            : doc.document_urls
                        )
                      }
                    >
                      {doc.document_type}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}

            {/* Payment Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <DollarSign className="mr-2 h-4 w-4" /> Payment
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {["Paid Online", "Paid On Site", "No Charge", "Pending"].map(
                  (s) => (
                    <DropdownMenuItem key={s} onClick={() => handlePayment(s)}>
                      {s}
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {/* Refund / Delete */}
            {request.amount_paid > 0 && (
              <DropdownMenuItem
                onClick={() => {
                  setRefundParams({ remove: false, title: "Refund Payment" });
                  setIsRefundOpen(true);
                }}
              >
                <Undo2 className="mr-2 h-4 w-4" /> Refund
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleReject} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" /> Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
