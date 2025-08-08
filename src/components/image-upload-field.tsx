import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDropzone } from "react-dropzone";
import Cropper, { type Area } from "react-easy-crop";
import { useCallback, useEffect, useState } from "react";
import { ImageUp } from "lucide-react";

interface ImageUploadFieldProps {
  value: File | string | null;
  onChange: (value: File | string | null) => void;
  iconOnly?: boolean;
  aspect?: number;
  allowUpload?: boolean;
  allowEmbed?: boolean;
}

export function ImageUploadField({
  value,
  onChange,
  iconOnly,
  aspect = 1,
  allowUpload = true,
  allowEmbed = true,
}: ImageUploadFieldProps) {
  const [mode, setMode] = useState<"upload" | "embed">(
    allowUpload ? "upload" : "embed"
  );
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const imageSrc =
    typeof value === "string"
      ? value
      : previewSrc ||
        (value instanceof File ? URL.createObjectURL(value) : null);

  useEffect(() => {
    if (mode === "upload" && previewSrc && croppedAreaPixels) {
      cropAndEmit(previewSrc, croppedAreaPixels);
    }
  }, [previewSrc, croppedAreaPixels]);

  const cropAndEmit = async (src: string, cropPixels: Area) => {
    const file = await createCroppedImage(src, cropPixels);
    if (file) {
      onChange(file);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleEmbedChange = (val: string) => {
    setPreviewSrc(null);
    onChange(val);
  };

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {iconOnly ? (
            <Button variant="default" size="icon">
              <ImageUp className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="outline" className="w-full justify-start gap-2">
              <ImageUp className="w-4 h-4" />
              {imageSrc ? (
                <div className="flex items-center gap-2">
                  <img
                    src={imageSrc}
                    alt="Preview"
                    className="h-6 w-6 rounded-sm object-cover border"
                  />
                  <span className="truncate max-w-[150px] text-sm text-muted-foreground">
                    Image selected
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Add an image
                </span>
              )}
            </Button>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-96 p-4 space-y-3" align="start">
          {(allowUpload || allowEmbed) && (
            <div className="flex space-x-2">
              {allowUpload && (
                <Button
                  type="button"
                  variant={mode === "upload" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMode("upload")}
                >
                  Upload
                </Button>
              )}
              {allowEmbed && (
                <Button
                  type="button"
                  variant={mode === "embed" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMode("embed")}
                >
                  Embed link
                </Button>
              )}
            </div>
          )}

          {mode === "upload" && allowUpload && (
            <>
              <Dropzone onDrop={onDrop} />
              {previewSrc && (
                <div className="relative h-60 w-full bg-muted rounded-md overflow-hidden">
                  <Cropper
                    image={previewSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect}
                    onCropChange={setCrop}
                    onCropComplete={(_, area) => setCroppedAreaPixels(area)}
                    onZoomChange={setZoom}
                  />
                </div>
              )}
            </>
          )}

          {mode === "embed" && allowEmbed && (
            <>
              <Input
                placeholder="Paste image link"
                value={typeof value === "string" ? value : ""}
                onChange={(e) => handleEmbedChange(e.target.value)}
              />
              {typeof value === "string" && value.trim() !== "" && (
                <img
                  src={value}
                  alt="Preview"
                  className="mt-2 max-h-60 rounded-md"
                />
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function Dropzone({ onDrop }: { onDrop: (files: File[]) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className="border border-dashed border-muted p-6 text-center rounded-md cursor-pointer hover:bg-muted/30"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the image here…</p>
      ) : (
        <p>Drag & drop or click to upload</p>
      )}
    </div>
  );
}

async function createCroppedImage(
  imageSrc: string,
  croppedAreaPixels: Area
): Promise<File | null> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], "cropped.jpg", { type: "image/jpeg" }));
      } else {
        resolve(null);
      }
    }, "image/jpeg");
  });
}
