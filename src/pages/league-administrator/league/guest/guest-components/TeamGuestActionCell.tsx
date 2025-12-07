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
import { toast } from "sonner";
import {
  MoreVertical,
  Check,
  X,
  DollarSign,
  Undo2,
  Trash2,
} from "lucide-react";

import { useLeagueGuestOperations } from "@/hooks/useLeagueGuestOperations";
import { getErrorMessage } from "@/lib/error";
import type { GuestRegistrationRequest } from "@/types/guest";
import { GuestRefundDialog } from "./GuestRefundDialog";

export function TeamGuestActionCell({
  request,
  categoryId,
}: {
  request: GuestRegistrationRequest;
  categoryId: string;
}) {
  const { updateMutation, deleteMutation, refundMutation } =
    useLeagueGuestOperations(categoryId);

  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [refundParams, setRefundParams] = useState({
    remove: false,
    title: "",
  });

  const handleAccept = () => {
    toast.promise(
      updateMutation.mutateAsync({
        id: request.guest_request_id,
        status: "Accepted",
      }),
      {
        loading: "Accepting team...",
        success: "Team accepted!",
        error: (e) => getErrorMessage(e),
      }
    );
  };

  const handleReject = () => {
    if (confirm("Reject and remove this team request?")) {
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

  return (
    <>
      <GuestRefundDialog
        isOpen={isRefundOpen}
        onClose={() => setIsRefundOpen(false)}
        onSubmit={handleRefund}
        title={refundParams.title}
        initialAmount={request.amount_paid}
      />

      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Team Actions</DropdownMenuLabel>

            {request.status === "Pending" && (
              <>
                <DropdownMenuItem
                  onClick={handleAccept}
                  className="text-green-600"
                >
                  <Check className="mr-2 h-4 w-4" /> Accept Team
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
