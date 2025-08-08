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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { ImageUploadField } from "@/components/image-upload-field";

export type LeagueReferees = {
  full_name: string;
  contact_info: string;
  photo_url: File | string;
  is_available: boolean;
};

export default function ManageRefereesComponent() {
  const [referees, setReferees] = useState<LeagueReferees[]>([]);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [form, setForm] = useState<LeagueReferees>({
    full_name: "",
    contact_info: "",
    photo_url: "",
    is_available: true,
  });

  const handleChange = (
    key: keyof LeagueReferees,
    value: string | File | null | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value ?? "",
    }));
  };

  const handleSubmit = () => {
    if (
      !form.full_name.trim() ||
      !form.contact_info.trim() ||
      !form.photo_url
    ) {
      toast.error("Please complete all fields before submitting.");
      return;
    }

    if (editIndex !== null) {
      const updated = [...referees];
      updated[editIndex] = form;
      setReferees(updated);
    } else {
      setReferees((prev) => [...prev, form]);
    }

    setForm({
      full_name: "",
      contact_info: "",
      photo_url: "",
      is_available: true,
    });
    setEditIndex(null);
    setOpen(false);
  };

  const handleEdit = (index: number) => {
    const ref = referees[index];
    setForm(ref);
    setEditIndex(index);
    setOpen(true);
  };

  const handleRemove = (index: number) => {
    setReferees((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <p className="text-helper">
          Manage referees and their availability for games.
        </p>
        <Dialog
          open={open}
          onOpenChange={(val) => {
            if (!val) {
              setEditIndex(null);
              setForm({
                full_name: "",
                contact_info: "",
                photo_url: "",
                is_available: true,
              });
            }
            setOpen(val);
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm">Add Referee</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editIndex !== null ? "Edit" : "Add"} Referee
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
                  value={form.photo_url}
                  onChange={(file) => handleChange("photo_url", file)}
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
              <TableHead>Contact Info</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referees.map((ref, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Avatar className="rounded-sm">
                    <AvatarImage
                      className="object-cover"
                      src={
                        typeof ref.photo_url === "string"
                          ? ref.photo_url
                          : URL.createObjectURL(ref.photo_url)
                      }
                      alt={ref.full_name}
                    />
                    <AvatarFallback>
                      {ref.full_name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{ref.full_name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {ref.contact_info}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={ref.is_available}
                    onCheckedChange={(val) => {
                      const updated = [...referees];
                      updated[idx].is_available = val;
                      setReferees(updated);
                    }}
                  />
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
