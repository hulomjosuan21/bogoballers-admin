import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { leagueAdminStaffService } from "@/service/leagueAdminStaffServie";
import { useAuthLeagueAdmin } from "@/hooks/useAuth";

import MultipleSelector, { type Option } from "@/components/ui/multiselect";
import { Permission } from "@/enums/permission";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CreateStaffDialog() {
  const [open, setOpen] = useState(false);
  const { leagueAdminId } = useAuthLeagueAdmin();

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [pin, setPin] = useState("");
  const [fullName, setFullName] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const [permissions, setPermissions] = useState<Option[]>([]);

  const queryClient = useQueryClient();

  const permissionOptions: Option[] = useMemo(() => {
    return Object.keys(Permission)
      .filter((v) => isNaN(Number(v)))
      .filter((key) => key !== Permission.ManageLeagueAdmins)
      .map((key) => ({
        value: key,
        label: key.replace(/([A-Z])/g, " $1").trim(),
      }));
  }, []);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!leagueAdminId) throw new Error("Missing League Admin ID");

      return await leagueAdminStaffService.register(
        {
          username,
          role_label: role,
          permissions: permissions.map((p) => p.value),
          pin,
          full_name: fullName,
          contact_info: contactInfo,
        },
        leagueAdminId
      );
    },
    onSuccess: () => {
      toast.success("Staff member created successfully");
      setOpen(false);
      setFullName("");
      setContactInfo("");
      setUsername("");
      setRole("");
      setPin("");
      setPermissions([]);
      queryClient.invalidateQueries({ queryKey: ["league-staff"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create staff");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"}>
          <Plus className="mr-2 h-4 w-4" /> Add Staff
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle>Add New Staff</DialogTitle>
            <DialogDescription>
              Create a profile for a referee, table official, or assistant.
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="h-[400px] w-full px-6">
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="contact_info">Contact Info</Label>
              <Input
                id="contact_info"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="e.g. +639..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. refereeJohn"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Head Official"
              />
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="pin">Security PIN</Label>
              <div className="flex justify-start">
                <InputOTP
                  maxLength={6}
                  value={pin}
                  onChange={(value) => setPin(value)}
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
              <p className="text-[0.8rem] text-muted-foreground">
                This 6-digit PIN will be used for quick access on every
                devices.
              </p>
            </div>

            <div className="col-span-2 flex flex-col gap-2 mb-2">
              <Label>Permissions</Label>
              <MultipleSelector
                value={permissions}
                onChange={setPermissions}
                options={permissionOptions}
                placeholder="Select permissions"
                emptyIndicator={
                  <p className="text-center text-sm">No permissions found.</p>
                }
              />
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 pt-0">
          <DialogFooter>
            <Button type="submit" onClick={() => mutate()} disabled={isPending}>
              {isPending ? "Creating..." : "Save changes"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
