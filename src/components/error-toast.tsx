import { getErrorMessage } from "@/lib/error";
import { toast } from "sonner";

export function useErrorToast() {

    return function handleErrorWithToast(
        error: unknown,
        options?: {
            onUnhandledError?: () => void;
        }
    ) {
        const message = getErrorMessage(error);
        toast.error(message);

        if (options?.onUnhandledError) {
            options.onUnhandledError();
        }
    };
}