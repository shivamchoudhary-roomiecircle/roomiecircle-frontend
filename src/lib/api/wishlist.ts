import { apiClient } from "./core";
import { ApiResponse, PagedResponse } from "../../types/api.types";

export interface WishlistRoomDto {
    id: number;
    monthlyRent: number | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    photos: { id: number; url: string; userId?: number }[];
    roomType: string | null;
    bhkType: number | null;
    floor: number | null;
    propertyTypes: string[];
    wishlistedAt: string;
    roomStatus: "ACTIVE" | "INACTIVE" | "ARCHIVED";
}

export const wishlistApi = {
    addToWishlist: async (roomId: number): Promise<ApiResponse<void>> => {
        return await apiClient.request<ApiResponse<void>>(`/api/v1/wishlist/${roomId}`, {
            method: 'POST'
        });
    },

    removeFromWishlist: async (roomId: number): Promise<ApiResponse<void>> => {
        return await apiClient.request<ApiResponse<void>>(`/api/v1/wishlist/${roomId}`, {
            method: 'DELETE'
        });
    },

    getWishlist: async (params?: { page?: number; size?: number }): Promise<ApiResponse<PagedResponse<WishlistRoomDto>>> => {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.append("page", params.page.toString());
        if (params?.size !== undefined) queryParams.append("size", params.size.toString());

        const queryString = queryParams.toString();
        const url = `/api/v1/wishlist${queryString ? `?${queryString}` : ''}`;

        return await apiClient.request<ApiResponse<PagedResponse<WishlistRoomDto>>>(url, {
            method: 'GET'
        });
    }
};
