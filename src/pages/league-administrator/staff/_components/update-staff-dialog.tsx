import { useMemo, useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import MultipleSelector, { type Option } from "@/components/ui/multiselect"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { Permission } from "@/enums/permission"
import { leagueAdminStaffService } from "@/service/leagueAdminStaffServie"

interface Staff {
    staff_id: string;
    username: string;
    full_name: string;
    contact_info: string;
    role_label: string;
    permissions: string[];
}

interface UpdateStaffProps {
    staff: Staff;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UpdateStaffDialog({ staff, open, onOpenChange }: UpdateStaffProps) {
  const [fullName, setFullName] = useState(staff.full_name || "")
  const [contactInfo, setContactInfo] = useState(staff.contact_info || "")
  const [username, setUsername] = useState(staff.username || "")
  const [role, setRole] = useState(staff.role_label || "")
  const [pin, setPin] = useState("") // Empty by default (means don't change)
  const [permissions, setPermissions] = useState<Option[]>([])

  const queryClient = useQueryClient()

  const permissionOptions: Option[] = useMemo(() => {
    return Object.keys(Permission)
      .filter((v) => isNaN(Number(v))) 
      .filter((key) => key !== Permission.ManageLeagueAdmins) 
      .map((key) => ({
        value: key,
        label: key.replace(/([A-Z])/g, ' $1').trim(),
      }))
  }, [])

  useEffect(() => {
    if (open && staff) {
        setFullName(staff.full_name)
        setContactInfo(staff.contact_info)
        setUsername(staff.username)
        setRole(staff.role_label)
        setPin("")
        
        const preSelected = permissionOptions.filter(opt => 
            staff.permissions.includes(opt.value)
        )
        setPermissions(preSelected)
    }
  }, [open, staff, permissionOptions])

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
        return await leagueAdminStaffService.update(staff.staff_id, {
            full_name: fullName,
            contact_info: contactInfo,
            username,
            role_label: role,
            permissions: permissions.map((p) => p.value),
            pin: pin.length === 6 ? pin : undefined 
        });
    },
    onSuccess: () => {
      toast.success("Staff updated successfully")
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ['league-staff'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update staff")
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <div className="p-6 pb-0">
            <DialogHeader>
                <DialogTitle>Edit Staff Member</DialogTitle>
            </DialogHeader>
        </div>

        <ScrollArea className="h-[400px] w-full px-6">
            <div className="grid grid-cols-2 gap-4 py-4">
            
            <div className="flex flex-col gap-2">
                <Label htmlFor="edit_full_name">Full Name</Label>
                <Input id="edit_full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="edit_contact">Contact Info</Label>
                <Input id="edit_contact" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="edit_username">Username</Label>
                <Input id="edit_username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="edit_role">Role</Label>
                <Input id="edit_role" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>

            <div className="col-span-2 flex flex-col gap-2">
                <Label>Security PIN</Label>
                <div className="flex justify-start">
                    <InputOTP maxLength={6} value={pin} onChange={setPin}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>
                <p className="text-[0.8rem] text-muted-foreground">
                    Leave blank to keep the current PIN. Enter a new 6-digit code to change it.
                </p>
            </div>

            <div className="col-span-2 flex flex-col gap-2 mb-2">
                <Label>Permissions</Label>
                <MultipleSelector
                    value={permissions}
                    onChange={setPermissions}
                    options={permissionOptions}
                />
            </div>
            </div>
        </ScrollArea>

        <div className="p-6 pt-0">
            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={() => mutate()} disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                </Button>
            </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}