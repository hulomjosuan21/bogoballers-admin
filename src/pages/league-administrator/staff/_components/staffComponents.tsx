import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { leagueAdminStaffService } from "@/service/leagueAdminStaffService";
import { useAuthLeagueAdmin } from "@/hooks/useAuth";

export function CreateSuperStaffGate() {
  const { leagueAdminId } = useAuthLeagueAdmin();
  const [fullName, setFullName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!leagueAdminId) {
        throw new Error("No League Admin Context");
      }
      await leagueAdminStaffService.createSuperStaff(
        { username, pin, full_name: fullName, contact_info: contactInfo },
        leagueAdminId
      );
    },
    onSuccess: () => {
      toast.success("Super Staff Created!");
      window.location.href = "/portal/league-administrator";
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to create account"),
  });

  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Setup Super Staff
          </CardTitle>
          <CardDescription>
            You have no staff configuration yet. Create a{" "}
            <strong>Super Account</strong>. This account will have full
            permissions ("ALL").
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Does"
            />
          </div>
          <div className="space-y-2">
            <Label>Contact Info</Label>
            <Input
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="e.g. +639....."
            />
          </div>
          <div className="space-y-2">
            <Label>Super Username</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. superStaff"
            />
          </div>
          <div className="space-y-2">
            <Label>Super PIN (6 Digits)</Label>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={pin} onChange={setPin}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
          <Button
            className="w-full"
            onClick={() => mutate()}
            disabled={isPending || pin.length < 6 || !username}
          >
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Create Super Account"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
