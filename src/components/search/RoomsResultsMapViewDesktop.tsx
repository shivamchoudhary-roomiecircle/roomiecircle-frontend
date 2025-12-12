import { LocationAutocomplete } from "./LocationAutocomplete";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { MapRadiusSlider } from "./MapRadiusSlider";
import { GoogleMap } from "./GoogleMap";
import { SearchFilters } from "./SearchFilters";
import { RoomSearchResultDTO } from "@/types/api.types";
import { SearchFilters as SearchFiltersType } from "@/hooks/useSearchFilters";

interface RoomsResultsMapViewDesktopProps {
    filters: SearchFiltersType;
    setters: any;
    setViewMode: (val: "list" | "map") => void;
    mapCenter: { lat: number; lng: number } | undefined;
    setMapCenter: (val: { lat: number; lng: number } | undefined) => void;
    rooms: RoomSearchResultDTO[];
}

export const RoomsResultsMapViewDesktop = ({
    filters,
    setters,
    setViewMode,
    mapCenter,
    setMapCenter,
    rooms,
}: RoomsResultsMapViewDesktopProps) => {
    const {
        location,
        radius,
        placeId,
        urgency,
        roomTypes,
        bhkTypes,
        propertyTypes,
        amenities,
    } = filters;

    const {
        handleLocationChange,
        setRadius,
        setUrgency,
        setRoomTypes,
        setBhkTypes,
        setPropertyTypes,
        setAmenities,
        setPlaceId,
        setLocation
    } = setters;

    return (
        <div className="block fixed inset-0 z-50 bg-background top-[138px]">
            {/* Full Screen Map */}
            <div className="h-full w-full">
                <GoogleMap
                    center={mapCenter}
                    listings={rooms}
                    onCenterChange={setMapCenter}
                    showMovablePin={true}
                    radiusKm={radius}
                    onInitialLocationFound={(loc) => {
                        if (!location && !placeId) {
                            setLocation(loc.address);
                            setPlaceId(loc.placeId || "");
                            setMapCenter({ lat: loc.lat, lng: loc.lng });
                        }
                    }}
                />
            </div>
        </div>
    );
};
