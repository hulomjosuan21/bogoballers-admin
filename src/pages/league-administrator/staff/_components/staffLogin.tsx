import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Users, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { leagueAdminStaffService } from "@/service/leagueAdminStaffService";

export default function StaffLoginPage() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("pin", pin);
      return await leagueAdminStaffService.login(formData);
    },
    onSuccess: (data) => {
      toast.success(data.message);
      window.location.href = "/portal/league-administrator";
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Invalid Username or PIN");
      setPin("");
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-1 mt-2">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              Staff Access
            </div>
          </CardTitle>
          <CardDescription className="text-helper pb-2">
            Login for Referees, Officials, and Scorekeepers.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="e.g. scorerJhon"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="pin">Security PIN</Label>
            </div>
            <div className="flex justify-center py-2">
              <InputOTP
                maxLength={6}
                value={pin}
                onChange={(val) => setPin(val)}
                disabled={isPending}
              >
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
            <p className="text-center text-xs text-muted-foreground">
              Enter your 6-digit assigned PIN code.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button size={"sm"} variant={"mono"}>
            Forgot Pin
          </Button>
          <Button
            size={"sm"}
            onClick={() => mutate()}
            disabled={isPending || !username || pin.length < 6}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Logging in...
              </>
            ) : (
              <>
                Enter Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      <div className="absolute bottom-6 text-center text-helper">
        <p>Restricted Access. Unauthorized use is prohibited.</p>
        <p>BogoBallers League System</p>
      </div>
    </div>
  );
}
