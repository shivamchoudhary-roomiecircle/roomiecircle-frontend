import { apiClient } from "./core";
import {
    ApiResponse,
    PlaceSuggestionDTO,
    PlaceAutocompleteResponse,
    RoomSearchFilterRequest,
    PagedResponse,
    RoomSearchResultDTO,
    RoomListingDetailDTO,
} from "@/types/api.types";

export const searchPlacesStartingWith = async (prefix: string, sessionToken?: string): Promise<PlaceSuggestionDTO[]> => {
    const params = new URLSearchParams({ "input": prefix });
    if (sessionToken) params.append("sessionToken", sessionToken);

    const response = await apiClient.request<ApiResponse<PlaceAutocompleteResponse>>(`/api/v1/places/autocomplete?${params.toString()}`, {
        skipAuth: true,
    });
    return response.data!.suggestions;
};

export const searchRoomsAroundPlace = async (filters: RoomSearchFilterRequest): Promise<PagedResponse<RoomSearchResultDTO>> => {
    const params = new URLSearchParams({
        page: (filters.page || 0).toString(),
        size: (filters.size || 10).toString(),
    });

    if (filters.placeId) params.append('placeId', filters.placeId);

    if (filters.radiusKm) params.append('radiusKm', filters.radiusKm.toString());
    if (filters.minRent) params.append('rentMin', filters.minRent.toString());
    if (filters.maxRent) params.append('rentMax', filters.maxRent.toString());
    if (filters.floorMin) params.append('floorMin', filters.floorMin.toString());
    if (filters.floorMax) params.append('floorMax', filters.floorMax.toString());
    if (filters.urgency) params.append('urgency', filters.urgency);
    if (filters.gender) params.append('gender', filters.gender);

    if (filters.propertyType?.length) {
        filters.propertyType.forEach(type => params.append('propertyType', type));
    }
    if (filters.roomType?.length) {
        filters.roomType.forEach(type => params.append('roomType', type));
    }
    if (filters.bhkType?.length) {
        filters.bhkType.forEach(type => params.append('bhkType', type));
    }
    if (filters.amenities?.length) {
        filters.amenities.forEach(amenity => params.append('amenities', amenity));
    }

    const response = await apiClient.request<ApiResponse<PagedResponse<RoomSearchResultDTO>>>(`/api/v1/search/rooms/location?${params.toString()}`, {
        skipAuth: true,
    });

    return response.data!;
};

export const searchRecentRooms = async (page: number = 0, size: number = 20): Promise<PagedResponse<RoomSearchResultDTO>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });
    const response = await apiClient.request<ApiResponse<PagedResponse<RoomSearchResultDTO>>>(`/api/v1/search/rooms/recent?${params.toString()}`, {
        skipAuth: true,
    });
    return response.data!;
};

export const searchRoomsByMap = async (
    center: { lat: number; lng: number },
    radiusKm: number,
    filters: RoomSearchFilterRequest = {}
): Promise<PagedResponse<RoomSearchResultDTO>> => {
    const params = new URLSearchParams({
        latitude: center.lat.toString(),
        longitude: center.lng.toString(),
        radiusKm: radiusKm.toString(),
        page: (filters.page || 0).toString(),
        size: (filters.size || 20).toString(),
    });

    if (filters.minRent) params.append('rentMin', filters.minRent.toString());
    if (filters.maxRent) params.append('rentMax', filters.maxRent.toString());
    if (filters.urgency) params.append('urgency', filters.urgency);

    if (filters.roomType?.length) {
        filters.roomType.forEach(type => params.append('roomType', type));
    }
    if (filters.bhkType?.length) {
        filters.bhkType.forEach(type => params.append('bhkType', type));
    }
    if (filters.propertyType?.length) {
        filters.propertyType.forEach(type => params.append('propertyType', type));
    }
    if (filters.amenities?.length) {
        filters.amenities.forEach(amenity => params.append('amenities', amenity));
    }

    const response = await apiClient.request<ApiResponse<PagedResponse<RoomSearchResultDTO>>>(`/api/v1/search/rooms/map?${params.toString()}`, {
        skipAuth: true,
    });
    return response.data!;
};

export const getRoomDetailsForSearch = async (roomId: string): Promise<RoomListingDetailDTO> => {
    const response = await apiClient.request<ApiResponse<RoomListingDetailDTO>>(`/api/v1/search/rooms/${roomId}`, {
        skipAuth: true,
    });
    return response.data!;
};
