// src/lib/axiosClient.ts
import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from "axios";

class AxiosClient {
    private readonly instance: AxiosInstance;

    constructor() {
        const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

        this.instance = axios.create({
            baseURL,
            timeout: 50000,
            timeoutErrorMessage: "Request timed out",
            withCredentials: true,
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        this.instance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                console.log("[Request]", {
                    url: config.url,
                    method: config.method,
                    data: config.data,
                    headers: config.headers,
                    withCredentials: config.withCredentials,
                });
                return config;
            }
        );

        this.instance.interceptors.response.use(
            (response: AxiosResponse) => {
                console.log("[Response]", {
                    url: response.config.url,
                    status: response.status,
                    data: response.data,
                });
                return response;
            },
            (error: unknown) => {
                console.error("[Error]", error);
                return Promise.reject(error);
            }
        );
    }

    public get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.instance.get<T>(url, config);
    }

    public post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.instance.post<T>(url, data, config);
    }

    public put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.instance.put<T>(url, data, config);
    }

    public delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.instance.delete<T>(url, config);
    }

    public get raw(): AxiosInstance {
        return this.instance;
    }
}

export default new AxiosClient();
