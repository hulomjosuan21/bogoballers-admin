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

// interface SmallButtonProps extends React.ComponentProps<typeof Button> {
//   children: React.ReactNode;
// }

// export function SmallButton({
//   children,
//   className,
//   onClick,
//   ...props
// }: SmallButtonProps) {
//   return (
//     <Button
//       variant={props.variant}
//       className={cn("h-6 px-2 text-xs rounded-sm", className)}
//       onClick={onClick}
//       {...props}
//     >
//       {children}
//     </Button>
//   );
// }
