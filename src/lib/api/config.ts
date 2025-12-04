import { apiClient } from "./core";
import {
    ApiResponse,
    ClientConfigResponse,
} from "@/types/api.types";

export const getConfiguration = async (): Promise<ClientConfigResponse> => {
    const response = await apiClient.request<ApiResponse<ClientConfigResponse>>("/api/v1/configuration", {
        skipAuth: true,
    });
    return response.data!;
};
