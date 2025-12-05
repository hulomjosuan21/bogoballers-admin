import { useAuthLeagueAdmin } from "@/hooks/useAuth";
import type { LeagueAdministator } from "@/types/leagueAdmin";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Check, ChevronsUpDown, Building2, MapPin, Phone } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import LeagueAdministratorService from "@/service/leagueAdminService";
import { toast } from "sonner";
import axiosClient from "@/lib/axiosClient";
import { getErrorMessage } from "@/lib/error";

export default function UpdateOrganizationTab() {
  const { leagueAdmin, leagueAdminLoading, refetchLeagueAdmin } =
    useAuthLeagueAdmin();

  const [formData, setFormData] = useState<Partial<LeagueAdministator>>({});
  const [profileImage, setProfileImage] = useState<string | File | null>(null);

  const [savingDetails, setSavingDetails] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);

  if (leagueAdminLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading organization details...
      </div>
    );
  }

  if (!leagueAdmin) {
    return (
      <div className="p-8 text-center text-destructive">
        No organization data found.
      </div>
    );
  }

  const handleChange = (field: keyof LeagueAdministator, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDetails = async () => {
    setSavingDetails(true);
    try {
      if (!leagueAdmin) {
        toast.error("Something went wrong!");
        return;
      }
      const payload: Partial<LeagueAdministator> = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== (leagueAdmin as any)[key]) {
          (payload as any)[key] = value;
        }
      });

      if (Object.keys(payload).length > 0) {
        const response = await LeagueAdministratorService.updateOne(
          leagueAdmin.league_administrator_id,
          payload
        );

        toast.success(response.message);
        await refetchLeagueAdmin();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingDetails(false);
    }
  };

  const handleSavePhoto = async () => {
    if (!profileImage) return;

    if (!leagueAdmin?.league_administrator_id) {
      toast.error("Admin details not found!");
      return;
    }

    setSavingPhoto(true);

    try {
      const formData = new FormData();
      formData.append("new_image", profileImage);

      const entityId = leagueAdmin.league_administrator_id;
      const accountType = "league_admin";
      const response = await axiosClient.put(
        `/entity/update/image/${entityId}/${accountType}`,
        formData
      );

      if (response.status === 200) {
        toast.success("Logo updated successfully!");
        await refetchLeagueAdmin();
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingPhoto(false);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Organization Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your league's public profile and contact information.
        </p>
      </div>
      <Separator />

      <div className="flex flex-col gap-6 md:flex-row items-start">
        <div className="w-full md:w-[300px] shrink-0 space-y-4">
          <Card className="rounded-md">
            <CardHeader className="p-1">
              <CardTitle className="text-base">Organization Logo</CardTitle>
              <CardDescription>
                This logo will appear on your league page and reports.
              </CardDescription>
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
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSavePhoto}
                disabled={savingPhoto || !profileImage}
              >
                {savingPhoto ? "Saving..." : "Update Logo"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 w-full">
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>
                Update your organization's identity and contact channels.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span>Identity</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
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
                      onValueChange={(val) =>
                        handleChange("organization_type", val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
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
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Location</span>
                </div>
                <div className="space-y-2">
                  <Label>Headquarters Address</Label>
                  <Popover open={addressOpen} onOpenChange={setAddressOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between font-normal",
                          !formData.organization_address &&
                            !leagueAdmin.organization_address &&
                            "text-muted-foreground"
                        )}
                      >
                        {formData.organization_address ??
                          leagueAdmin.organization_address ??
                          "Select barangay or city"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
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
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>Contact Information</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact_number_primary">
                      Primary Contact
                    </Label>
                    <Input
                      id="contact_number_primary"
                      defaultValue={leagueAdmin.account.contact_number}
                      onChange={(e) =>
                        handleChange("account", {
                          ...leagueAdmin.account,
                          contact_number: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization_country">Country</Label>
                    <Input
                      id="organization_country"
                      defaultValue={leagueAdmin.organization_country}
                      onChange={(e) =>
                        handleChange("organization_country", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization_province">Province</Label>
                    <Input
                      id="organization_province"
                      defaultValue={leagueAdmin.organization_province}
                      onChange={(e) =>
                        handleChange("organization_province", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization_municipality">
                      Municipality
                    </Label>
                    <Input
                      id="organization_municipality"
                      defaultValue={leagueAdmin.organization_municipality}
                      onChange={(e) =>
                        handleChange(
                          "organization_municipality",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
              <Button
                onClick={handleSaveDetails}
                disabled={savingDetails}
                className="min-w-[120px]"
              >
                {savingDetails ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
