import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface RefundDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, reason: string) => void;
  title: string;
  initialAmount: number;
}

export function GuestRefundDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialAmount,
}: RefundDialogProps) {
  // Initialize with the paid amount, convert to string for Input handling
  const [amount, setAmount] = useState(String(initialAmount));
  const [reason, setReason] = useState("Requested by customer");

  // Reset form state when the dialog opens
  useEffect(() => {
    if (isOpen) {
      setAmount(String(initialAmount));
      setReason("Requested by customer");
    }
  }, [isOpen, initialAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Please enter a valid amount greater than zero.");
      return;
    }

    if (numericAmount > initialAmount) {
      toast.error(
        `Refund amount cannot exceed the paid amount of ${initialAmount}.`
      );
      return;
    }

    onSubmit(numericAmount, reason);
    // Note: We don't close here automatically if you want to wait for the promise in parent,
    // but based on your ActionCell implementation, the parent calls onClose manually or we call it here.
    // In the previous ActionCell code, we handle closing in the parent success, but calling it here is safe UX.
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Enter the amount to refund. This action will be recorded in the
              payment history.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">
                Refund Amount (Max: {initialAmount})
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                max={initialAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. User requested, Duplicate payment"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              Confirm Refund
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
