export class ApiResponse<T> {
    status: boolean;
    message: string;
    redirect?: string;
    payload?: T;

    constructor(params: {
        status: boolean;
        message: string;
        redirect?: string;
        payload?: T;
    }) {
        this.status = params.status;
        this.message = params.message;
        this.redirect = params.redirect;
        this.payload = params.payload;
    }

    static fromJson<T>(
        json: unknown,
        fromJsonT?: (json: unknown) => T
    ): ApiResponse<T> {
        if (typeof json !== "object" || json === null) {
            throw new Error("Invalid JSON: not an object");
        }

        const obj = json as {
            status?: boolean;
            message?: string;
            redirect?: string;
            payload?: unknown;
        };

        return new ApiResponse<T>({
            status: obj.status ?? false,
            message: obj.message ?? "",
            redirect: obj.redirect,
            payload: obj.payload
                ? fromJsonT
                    ? fromJsonT(obj.payload)
                    : (obj.payload as T)
                : undefined,
        });
    }

    static fromJsonNoPayload<T>(json: unknown): ApiResponse<T> {
        if (typeof json !== "object" || json === null) {
            throw new Error("Invalid JSON: not an object");
        }

        const obj = json as {
            status?: boolean;
            message?: string;
            redirect?: string;
        };

        return new ApiResponse<T>({
            status: obj.status ?? false,
            message: obj.message ?? "",
            redirect: obj.redirect,
            payload: undefined,
        });
    }
}
