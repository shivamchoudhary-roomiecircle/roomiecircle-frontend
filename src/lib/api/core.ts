import JSONbig from "json-bigint";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
    public fieldErrors: Record<string, string>;

    constructor(message: string, fieldErrors: Record<string, string>) {
        super(message);
        this.name = 'ValidationError';
        this.fieldErrors = fieldErrors;
    }
}

export class ApiClient {
    private isRefreshing = false;
    private refreshSubscribers: ((token: string) => void)[] = [];

    private getAuthHeader(): HeadersInit {
        const token = localStorage.getItem("accessToken");
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    private onRefreshed(token: string) {
        this.refreshSubscribers.forEach((callback) => callback(token));
        this.refreshSubscribers = [];
    }

    private addRefreshSubscriber(callback: (token: string) => void) {
        this.refreshSubscribers.push(callback);
    }

    public async request<T>(endpoint: string, options: RequestInit & { skipAuth?: boolean } = {}): Promise<T> {
        const { skipAuth, ...fetchOptions } = options;
        // console.log(`[API] Starting request to ${API_BASE_URL}${endpoint}`, fetchOptions);

        const makeRequest = async (token?: string) => {
            const headers = {
                "Content-Type": "application/json",
                ...(skipAuth ? {} : (token ? { Authorization: `Bearer ${token}` } : this.getAuthHeader())),
                ...fetchOptions.headers,
            };

            return fetch(`${API_BASE_URL}${endpoint}`, {
                ...fetchOptions,
                headers,
            });
        };

        let response = await makeRequest();
        // console.log(`[API] Response from ${endpoint}:`, response.status, response.statusText);

        // Parse response using json-bigint to handle large numbers (like Snowflake IDs)
        const text = await response.text();
        const responseData = text ? JSONbig({ storeAsString: true }).parse(text) : null;

        // Check for TOKEN_EXPIRED error in response
        if (responseData && responseData.success === false && responseData.error === "TOKEN_EXPIRED") {
            // Dispatch unauthorized event instead of direct redirect
            window.dispatchEvent(new CustomEvent('auth:unauthorized', {
                detail: { message: responseData.message || "Your session has expired. Please login again to continue." }
            }));
            throw new Error(responseData.message || "Token expired");
        }

        if (response.status === 401) {
            // For login/auth endpoints (skipAuth: true), extract error message from response
            if (skipAuth && responseData) {
                const errorMessage = responseData.message || "Authentication failed";
                throw new Error(errorMessage);
            }

            // For other endpoints, try to refresh token
            if (!this.isRefreshing) {
                this.isRefreshing = true;
                const refreshed = await this.refreshToken();
                this.isRefreshing = false;

                if (refreshed) {
                    const newToken = localStorage.getItem("accessToken");
                    this.onRefreshed(newToken || "");
                    // Retry the original request
                    return this.request(endpoint, options);
                } else {
                    // Dispatch unauthorized event
                    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
                    throw new Error(responseData?.message || "Authentication failed");
                }
            }

            // If already refreshing, wait for the new token
            return new Promise((resolve) => {
                this.addRefreshSubscriber((token) => {
                    // Retry the request with the new token
                    resolve(this.request(endpoint, options));
                });
            });
        }

        if (!response.ok) {
            const error = responseData || { message: "Request failed" };

            // Check for validation errors (VALIDATION_001)
            if (error.error === "VALIDATION_001" && error.data && typeof error.data === "object") {
                // The data field contains field-specific validation errors
                throw new ValidationError(error.message || "Validation failed", error.data);
            }

            throw new Error(error.message || "Request failed");
        }

        return responseData;
    }

    async refreshToken(): Promise<boolean> {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) return false;

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/token/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) return false;

            const data = await response.json();
            const accessToken = data.accessToken || data.data?.accessToken;
            if (accessToken) {
                localStorage.setItem("accessToken", accessToken);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }
}

export const apiClient = new ApiClient();
