// AlertDialogContext.tsx
import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import {
  AlertDialog,
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

interface AlertDialogContextType {
  openDialog: (options?: AlertDialogOptions) => Promise<boolean>;
}

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(
  undefined
);

const DEFAULT_OPTIONS: Required<AlertDialogOptions> = {
  title: "Are you sure?",
  description: "This action cannot be undone.",
  cancelText: "Cancel",
  confirmText: "Continue",
};

export function AlertDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null
  );
  const [currentOptions, setCurrentOptions] =
    useState<Required<AlertDialogOptions>>(DEFAULT_OPTIONS);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

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

  const handleCancel = () => {
    resolver?.(false);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      confirmButtonRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <AlertDialogContext.Provider value={{ openDialog }}>
      {children}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
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
    </AlertDialogContext.Provider>
  );
}

export function useAlertDialog() {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error(
      "useAlertDialog must be used within an AlertDialogProvider"
    );
  }
  return context;
}
