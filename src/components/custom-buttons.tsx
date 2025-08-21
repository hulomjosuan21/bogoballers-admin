import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as React from "react";

type ButtonLoadingProps = React.ComponentPropsWithoutRef<typeof Button> & {
  loading?: boolean;
  loadingText?: React.ReactNode;
};

export function ButtonLoading({
  loading = false,
  loadingText = "Please wait",
  disabled,
  className,
  children,
  ...props
}: ButtonLoadingProps) {
  return (
    <Button
      disabled={loading || disabled}
      className={cn(loading && "gap-2", className)}
      {...props}
    >
      {loading && <Loader2Icon className="animate-spin h-4 w-4" />}
      {loading ? loadingText : children}
    </Button>
  );
}
