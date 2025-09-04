import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface AlertDialogOptions {
  title?: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
}

const DEFAULT_OPTIONS: Required<AlertDialogOptions> = {
  title: "Are you sure?",
  description: "This action cannot be undone.",
  cancelText: "Cancel",
  confirmText: "Continue",
};

export function useAlertDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null
  );
  const [currentOptions, setCurrentOptions] =
    useState<Required<AlertDialogOptions>>(DEFAULT_OPTIONS);
  const openDialog = (options?: AlertDialogOptions) =>
    new Promise<boolean>((resolve) => {
      setCurrentOptions({ ...DEFAULT_OPTIONS, ...options });
      setResolver(() => resolve);
      setIsOpen(true);
    });

  const handleConfirm = () => {
    resolver?.(true);
    setIsOpen(false);
  };

  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      confirmButtonRef.current?.focus();
    }
  }, [isOpen]);

  const handleCancel = () => {
    resolver?.(false);
    setIsOpen(false);
  };

  const AlertDialogComponent = ({ trigger }: { trigger?: ReactNode }) => (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{currentOptions.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {currentOptions.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {currentOptions.cancelText}
          </AlertDialogCancel>
          <AlertDialogAction ref={confirmButtonRef} onClick={handleConfirm}>
            {currentOptions.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { openDialog, AlertDialogComponent };
}
