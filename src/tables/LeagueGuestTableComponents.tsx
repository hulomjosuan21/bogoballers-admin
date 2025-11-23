import React, { useState, useCallback } from "react";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Check,
  MoreVertical,
  X,
  Undo2,
  FileText,
  ExternalLink,
} from "lucide-react";

import { useLeagueTeams } from "@/hooks/useLeagueGuest";
import { useGuestRequestMutation } from "@/hooks/useLeagueGuest";
import { getErrorMessage } from "@/lib/error";

import type { GuestRegistrationRequest } from "@/types/guest";
import { isPlayer, isTeam } from "./LeagueGuestTable";

type GuestActionCellProps = {
  request: GuestRegistrationRequest;
  refresh: () => Promise<unknown>;
};

export function GuestActionCell({ request, refresh }: GuestActionCellProps) {
  const { mutateAsync: updateRequest } = useGuestRequestMutation();
  const documents = isPlayer(request.details)
    ? request.details.valid_documents
    : [];

  const { data: teams, isLoading: isLoadingTeams } = useLeagueTeams(
    request.league_category_id
  );

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "Accepted" | "Rejected" | "Pending" | null
  >(null);

  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [refundParams, setRefundParams] = useState({
    remove: false,
    title: "",
  });

  const patchRequest = useCallback(
    async (data: Record<string, any>, successMsg: string) => {
      const req = updateRequest({
        method: "PATCH",
        guest_request_id: request.guest_request_id,
        body: data,
      });

      toast.promise(req, {
        loading: "Processing...",
        success: successMsg,
        error: (err) => getErrorMessage(err) ?? "Something went wrong.",
      });

      return req.finally(refresh);
    },
    [updateRequest, refresh, request.guest_request_id]
  );

  const refundRequest = useCallback(
    async (amount: number, _: string, remove: boolean) => {
      const req = updateRequest({
        method: "POST",
        endpoint: "refund",
        body: {
          guest_request_id: request.guest_request_id,
          amount,
          remove,
        },
      });

      toast.promise(req, {
        loading: "Processing refund...",
        success: "Refund processed.",
        error: (err) => getErrorMessage(err) ?? "Something went wrong.",
      });

      return req.finally(refresh);
    },
    [updateRequest, refresh, request.guest_request_id]
  );

  const confirmAcceptTeam = async () => {
    await patchRequest(
      { status: "Accepted" },
      "Guest team accepted successfully."
    );
  };

  const confirmAssignPlayer = async () => {
    if (!selectedTeamId) {
      toast.error("Please select a team.");
      return;
    }

    await patchRequest(
      {
        status: "Accepted",
        assign_to_team_id: selectedTeamId,
      },
      "Guest player assigned and accepted."
    );

    setIsAssignOpen(false);
  };

  const confirmReject = async () => {
    await patchRequest(
      { status: "Rejected" },
      "Request rejected successfully."
    );
  };

  const handleSetPayment = async (payment_status: string) => {
    await patchRequest(
      {
        payment_status,
        amount_paid: request.amount_paid ?? 0,
      },
      `Payment status updated to ${payment_status}.`
    );
  };

  const openWindow = (url: string) => {
    window.open(
      url,
      "_blank",
      "width=1000,height=800,resizable=yes,scrollbars=yes"
    );
  };

  const handleConfirm = async () => {
    if (confirmAction === "Accepted") return confirmAcceptTeam();
    if (confirmAction === "Rejected") return confirmReject();
  };

  const handleRefund = async (amount: number, reason: string) => {
    await refundRequest(amount, reason, refundParams.remove);
    setIsRefundOpen(false);
  };

  if (request.status !== "Pending") return null;

  return (
    <>
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Player to Team</DialogTitle>
            <DialogDescription>Select a team to assign.</DialogDescription>
          </DialogHeader>

          <Select onValueChange={(v) => setSelectedTeamId(v)}>
            <SelectTrigger disabled={isLoadingTeams}>
              <SelectValue placeholder="Select team..." />
            </SelectTrigger>
            <SelectContent>
              {teams?.map((t) => (
                <SelectItem key={t.team_id} value={t.team_id}>
                  {t.team_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAssignPlayer}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "Accepted"
                ? "Accept guest team?"
                : confirmAction === "Rejected"
                ? "Reject request?"
                : "Remove request?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={handleConfirm}>Confirm</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RefundDialog
        isOpen={isRefundOpen}
        onClose={() => setIsRefundOpen(false)}
        initialAmount={request.amount_paid ?? 0}
        title={refundParams.title}
        onSubmit={handleRefund}
      />

      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuItem
              className="text-green-600"
              onClick={() => {
                if (request.request_type === "Player") {
                  setIsAssignOpen(true);
                } else {
                  setConfirmAction("Accepted");
                  setIsConfirmOpen(true);
                }
              }}
            >
              <Check className="mr-2 h-4 w-4" />
              Accept
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                setConfirmAction("Rejected");
                setIsConfirmOpen(true);
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuLabel>Documents</DropdownMenuLabel>
            {documents && documents.length > 0 ? (
              documents.map((doc) => {
                const urls = doc.document_urls;
                const isMultiple = Array.isArray(urls) && urls.length > 1;

                if (isMultiple) {
                  return (
                    <DropdownMenuSub key={doc.doc_id}>
                      <DropdownMenuSubTrigger className="cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>{doc.document_type}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {urls.length} pages
                        </span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {urls.map((url, index) => (
                          <DropdownMenuItem
                            key={`${doc.doc_id}-${index}`}
                            className="cursor-pointer"
                            onClick={() => openWindow(url)}
                          >
                            <span>View Doc #{index + 1}</span>
                            <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  );
                } else {
                  const singleUrl = Array.isArray(urls) ? urls[0] : urls;
                  return (
                    <DropdownMenuItem
                      key={doc.doc_id}
                      className="cursor-pointer"
                      onClick={() => openWindow(singleUrl)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{doc.document_type}</span>
                    </DropdownMenuItem>
                  );
                }
              })
            ) : (
              <DropdownMenuItem disabled>No documents found</DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Payment</DropdownMenuLabel>

            <DropdownMenuItem onClick={() => handleSetPayment("Paid Online")}>
              Paid Online
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => handleSetPayment("Paid On Site")}>
              Paid On Site
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => handleSetPayment("No Charge")}>
              No Charge
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                setRefundParams({
                  remove: false,
                  title: `Refund ${
                    isPlayer(request.details)
                      ? request.details.full_name
                      : isTeam(request.details)
                      ? request.details.team_name
                      : "Guest"
                  }`,
                });
                setIsRefundOpen(true);
              }}
            >
              <Undo2 className="mr-2 h-4 w-4" />
              Refund
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

type RefundDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, reason: string) => void;
  title: string;
  initialAmount: number;
};

export function RefundDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialAmount,
}: RefundDialogProps) {
  const [amount, setAmount] = useState(String(initialAmount ?? 0));
  const [reason, setReason] = useState("Requested by customer");

  const submitRefund = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return toast.error("Invalid amount");
    onSubmit(amt, reason);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={submitRefund}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>Enter refund details</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Label>Amount</Label>
            <Input
              value={amount}
              type="number"
              onChange={(e) => setAmount(e.target.value)}
            />

            <Label>Reason</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Confirm Refund</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
