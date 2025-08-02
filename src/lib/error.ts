export function getErrorMessage(error: unknown): string {
    // Check if error is an Axios-like object with response.data.message or response.data.detail
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as Record<string, unknown>).response === "object"
    ) {
        const response = (error as { response?: unknown }).response;

        if (
            response &&
            typeof response === "object" &&
            "data" in response &&
            typeof (response as Record<string, unknown>).data === "object"
        ) {
            const data = (response as { data?: unknown }).data;

            if (
                data &&
                typeof data === "object"
            ) {
                if ("message" in data && typeof (data as Record<string, unknown>).message === "string") {
                    return (data as Record<string, string>).message;
                }
                if ("detail" in data && typeof (data as Record<string, unknown>).detail === "string") {
                    return (data as Record<string, string>).detail;
                }
            }
        }
    }

    // JS Error instance
    if (error instanceof Error) {
        return error.message;
    }

    // Object with message
    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as Record<string, unknown>).message === "string"
    ) {
        return (error as Record<string, string>).message;
    }

    // String error
    if (typeof error === "string") {
        return error;
    }

    // Fallback to JSON or toString
    try {
        return JSON.stringify(error);
    } catch {
        return String(error);
    }
}
