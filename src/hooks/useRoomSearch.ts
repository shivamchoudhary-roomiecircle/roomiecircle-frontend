import { useInfiniteQuery } from "@tanstack/react-query";
import { searchApi } from "@/lib/api";
import { SearchFilters } from "./useSearchFilters";

interface UseRoomSearchProps {
    filters: SearchFilters;
    viewMode: "list" | "map";
    debouncedMapCenter: { lat: number; lng: number } | undefined;
}

export const useRoomSearch = ({ filters, viewMode, debouncedMapCenter }: UseRoomSearchProps) => {
    const {
        placeId,
        radius,
        minPrice,
        maxPrice,
        roomTypes,
        bhkTypes,
        propertyTypes,
        amenities,
        urgency,
    } = filters;

    return useInfiniteQuery({
        queryKey: [
            'rooms',
            placeId,
            radius,
            minPrice,
            maxPrice,
            roomTypes,
            bhkTypes,
            propertyTypes,
            amenities,
            urgency,
            viewMode,
            debouncedMapCenter
        ],
        queryFn: async ({ pageParam = 0 }) => {
            // Common filters
            const commonFilters = {
                minRent: minPrice ? parseInt(minPrice) : undefined,
                maxRent: maxPrice ? parseInt(maxPrice) : undefined,
                roomType: roomTypes.length > 0 ? roomTypes : undefined,
                bhkType: bhkTypes.length > 0 ? bhkTypes : undefined,
                propertyType: propertyTypes.length > 0 ? propertyTypes : undefined,
                amenities: amenities.length > 0 ? amenities : undefined,
                urgency: urgency,
                page: pageParam,
                size: 20
            };

            if (viewMode === 'map' && debouncedMapCenter) {
                return await searchApi.searchRoomsByMap(
                    debouncedMapCenter,
                    radius || 5,
                    commonFilters
                );
            } else {
                if (placeId) {
                    return await searchApi.searchRoomsAroundPlace({
                        placeId: placeId,
                        radiusKm: radius || 5,
                        ...commonFilters
                    });
                } else {
                    return await searchApi.searchRecentRooms(pageParam, 20);
                }
            }
        },
        getNextPageParam: (lastPage) => {
            return lastPage.last ? undefined : lastPage.page + 1;
        },
        initialPageParam: 0,
        enabled: viewMode === 'list' || (viewMode === 'map' && !!debouncedMapCenter),
    });
};
