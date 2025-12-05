import { apiClient } from "./core";
import {
    ApiResponse,
    RoomListingDTO,
    MyRoomsResponse,
} from "@/types/api.types";

export const updateRoomStatus = async (roomId: string, status: string): Promise<RoomListingDTO> => {
    console.log('updateRoomStatus API call:', { roomId, status, body: { status } });
    const response = await apiClient.request<ApiResponse<RoomListingDTO>>(`/api/v1/listings/rooms/${roomId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });
    return response.data!;
};

export const deleteRoom = async (roomId: string): Promise<void> => {
    await apiClient.request<ApiResponse<null>>(`/api/v1/listings/rooms/${roomId}`, {
        method: "DELETE",
    });
};

export const createRoom = async (payload?: any): Promise<RoomListingDTO> => {
    const response = await apiClient.request<ApiResponse<RoomListingDTO>>("/api/v1/listings/rooms", {
        method: "POST",
        body: payload ? JSON.stringify(payload) : undefined,
    });
    return response.data!;
};

export const updateRoom = async (roomId: string, data: any): Promise<RoomListingDTO> => {
    const response = await apiClient.request<ApiResponse<RoomListingDTO>>(`/api/v1/listings/rooms/${roomId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    return response.data!;
};

export const getMyRooms = async (status?: "ACTIVE" | "INACTIVE"): Promise<RoomListingDTO[]> => {
    const params = status ? `?status=${status}` : "";
    const response = await apiClient.request<ApiResponse<MyRoomsResponse>>(`/api/v1/listings/rooms/my${params}`);

    // Handle both response formats:
    // The API returns { active: RoomListingDTO[], inactive: RoomListingDTO[] }
    if (response.data && typeof response.data === 'object') {
        if (status === "ACTIVE") {
            return Array.isArray(response.data.active) ? response.data.active : [];
        } else if (status === "INACTIVE") {
            return Array.isArray(response.data.inactive) ? response.data.inactive : [];
        }
        // If no status specified, return both combined
        const active = Array.isArray(response.data.active) ? response.data.active : [];
        const inactive = Array.isArray(response.data.inactive) ? response.data.inactive : [];
        return [...active, ...inactive];
    }
    return [];
};

export const getRoomDetails = async (roomId: string): Promise<RoomListingDTO> => {
    const response = await apiClient.request<ApiResponse<RoomListingDTO>>(`/api/v1/listings/rooms/${roomId}`);
    return response.data!;
};
