import { useAuthLeagueAdmin } from "@/hooks/useAuth";
import type { LeagueAdministator } from "@/types/leagueAdmin";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploadField } from "./image-upload-field";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StaticData } from "@/data";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export default function UpdateOrganizationTab() {
  const { leagueAdmin, leagueAdminLoading, refetchLeagueAdmin } =
    useAuthLeagueAdmin();

  const [formData, setFormData] = useState<Partial<LeagueAdministator>>({});
  const [profileImage, setProfileImage] = useState<string | File | null>(null);

  const [savingDetails, setSavingDetails] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);

  if (leagueAdminLoading) {
    return <div>Loading...</div>;
  }

  if (!leagueAdmin) {
    return <div>No organization data found.</div>;
  }

  const handleChange = (field: keyof LeagueAdministator, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDetails = async () => {
    setSavingDetails(true);
    try {
      const payload: Partial<LeagueAdministator> = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== (leagueAdmin as any)[key]) {
          (payload as any)[key] = value;
        }
      });

      if (Object.keys(payload).length > 0) {
        console.log("Updating details:", payload);
        // TODO: call API -> await updateLeagueAdmin(payload);
        await refetchLeagueAdmin();
      }
    } catch (error) {
      console.error("Failed to update details:", error);
    } finally {
      setSavingDetails(false);
    }
  };

  const handleSavePhoto = async () => {
    if (!profileImage) return;
    setSavingPhoto(true);
    try {
      const payload: Partial<LeagueAdministator> = {
        organization_logo_url:
          typeof profileImage === "string" ? profileImage : "uploaded_file_url",
      };

      console.log("Updating logo:", payload);
      // TODO: call API -> await updateLeagueAdmin(payload);
      await refetchLeagueAdmin();
    } catch (error) {
      console.error("Failed to update logo:", error);
    } finally {
      setSavingPhoto(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 rounded-md">
        <CardHeader>
          <CardTitle>Organization logo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <ImageUploadField
            value={profileImage ?? leagueAdmin.organization_logo_url}
            onChange={setProfileImage}
            allowUpload
            allowEmbed
            iconOnly={false}
            aspect={16 / 9}
          />
          <Button onClick={handleSavePhoto} disabled={savingPhoto}>
            {savingPhoto ? "Saving..." : "Update Logo"}
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 rounded-md">
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="organization_name">Organization Name</Label>
              <Input
                id="organization_name"
                defaultValue={leagueAdmin.organization_name}
                onChange={(e) =>
                  handleChange("organization_name", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Organization Type</Label>
              <Select
                defaultValue={leagueAdmin.organization_type}
                onValueChange={(val) => handleChange("organization_type", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization type" />
                </SelectTrigger>
                <SelectContent>
                  {StaticData.OrganizationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Organization Address</Label>
            <Popover open={addressOpen} onOpenChange={setAddressOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !formData.organization_address &&
                      !leagueAdmin.organization_address &&
                      "text-muted-foreground"
                  )}
                >
                  {formData.organization_address ??
                    leagueAdmin.organization_address ??
                    "Select address"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search address..." />
                  <CommandList>
                    <CommandEmpty>No address found.</CommandEmpty>
                    <CommandGroup>
                      {StaticData.Barangays.map((address) => (
                        <CommandItem
                          value={address}
                          key={address}
                          onSelect={() => {
                            handleChange("organization_address", address);
                            setAddressOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              address ===
                                (formData.organization_address ??
                                  leagueAdmin.organization_address)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {address}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_number">Contact Number</Label>
            <Input
              id="contact_number"
              defaultValue={leagueAdmin.account.contact_number}
              onChange={(e) =>
                handleChange("account", {
                  ...leagueAdmin.account,
                  contact_number: e.target.value,
                })
              }
            />
          </div>

          <Separator />

          <Button onClick={handleSaveDetails} disabled={savingDetails}>
            {savingDetails ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
