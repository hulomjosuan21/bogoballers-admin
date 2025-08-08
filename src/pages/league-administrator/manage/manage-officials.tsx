import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ImageUploadField } from "@/components/image-upload-field";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import InputSelect from "@/components/input-select";
import { toast } from "sonner";

export type LeagueOfficial = {
  full_name: string;
  role: string;
  contact_info: string;
  photo: File | string;
};

const UNIQUE_ROLES: string[] = [
  "League Commissioner",
  "Tournament Director",
  "Statistician",
  "Technical Committee Head",
  "Treasurer",
  "Disciplinary Committee Head",
  "Secretary",
];

const MULTIPLE_ROLES: string[] = [];

export default function ManageOfficialsComponent() {
  const [officials, setOfficials] = useState<LeagueOfficial[]>([]);
  const [form, setForm] = useState<LeagueOfficial>({
    full_name: "",
    role: "",
    contact_info: "",
    photo: "",
  });
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleChange = (
    key: keyof LeagueOfficial,
    value: string | File | null
  ) => {
    setForm((prev) => ({ ...prev, [key]: value ?? "" }));
  };

  const handleSubmit = () => {
    if (
      !form.full_name.trim() ||
      !form.role.trim() ||
      !form.contact_info.trim() ||
      !form.photo
    ) {
      toast.error("Please complete all fields before submitting.");
      return;
    }

    if (editIndex !== null) {
      const updated = [...officials];
      updated[editIndex] = form;
      setOfficials(updated);
    } else {
      setOfficials((prev) => [...prev, form]);
    }

    setForm({ full_name: "", role: "", contact_info: "", photo: "" });
    setEditIndex(null);
    setOpen(false);
  };

  const handleEdit = (index: number) => {
    const official = officials[index];
    setForm(official);
    setEditIndex(index);
    setOpen(true);
  };

  const handleRemove = (index: number) => {
    setOfficials((prev) => prev.filter((_, i) => i !== index));
  };

  const selectedUniqueRoles = officials
    .filter((_, i) => i !== editIndex)
    .filter((o) => !MULTIPLE_ROLES.includes(o.role))
    .map((o) => o.role);

  const availableRoles = [...UNIQUE_ROLES, ...MULTIPLE_ROLES];

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <p className="text-helper">
          Manage the officials involved in organizing and overseeing the league.
        </p>
        <Dialog
          open={open}
          onOpenChange={(val) => {
            if (!val) {
              setEditIndex(null);
              setForm({
                full_name: "",
                role: "",
                contact_info: "",
                photo: "",
              });
            }
            setOpen(val);
          }}
        >
          <DialogTrigger asChild>
            <Button size={"sm"}>Add League Official</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editIndex !== null ? "Edit" : "Add"} League Official
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Full Name</Label>
                <Input
                  value={form.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Role</Label>
                <InputSelect
                  value={form.role}
                  onChange={(val) => handleChange("role", val)}
                  options={availableRoles.filter(
                    (role) =>
                      !(
                        UNIQUE_ROLES.includes(role) &&
                        selectedUniqueRoles.includes(role) &&
                        role !== form.role
                      )
                  )}
                  placeholder="Select role"
                />
              </div>

              <div className="grid gap-2">
                <Label>Contact Info</Label>
                <Input
                  value={form.contact_info}
                  onChange={(e) => handleChange("contact_info", e.target.value)}
                  placeholder="Email or Phone"
                />
              </div>

              <div className="grid gap-2">
                <Label>Photo</Label>
                <ImageUploadField
                  value={form.photo}
                  onChange={(file) => handleChange("photo", file)}
                  allowUpload
                  allowEmbed
                  iconOnly={false}
                  aspect={1}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button onClick={handleSubmit}>
                {editIndex !== null ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>Photo</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {officials.map((official, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Avatar className="rounded-sm">
                    <AvatarImage
                      className="object-cover"
                      src={
                        typeof official.photo === "string"
                          ? official.photo
                          : URL.createObjectURL(official.photo)
                      }
                      alt={official.full_name}
                    />
                    <AvatarFallback>
                      {official.full_name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  {official.full_name}
                </TableCell>
                <TableCell>{official.role}</TableCell>
                <TableCell className="text-muted-foreground">
                  {official.contact_info}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(idx)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRemove(idx)}>
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
