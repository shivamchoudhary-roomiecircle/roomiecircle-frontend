import { LocationAutocomplete } from "./LocationAutocomplete";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { MapRadiusSlider } from "./MapRadiusSlider";
import { GoogleMap } from "./GoogleMap";
import { SearchFilters } from "./SearchFilters";
import { RoomSearchResultDTO } from "@/types/api.types";
import { SearchFilters as SearchFiltersType } from "@/hooks/useSearchFilters";

interface RoomsResultsMapViewMobileProps {
    filters: SearchFiltersType;
    setters: any;
    setViewMode: (val: "list" | "map") => void;
    mapCenter: { lat: number; lng: number } | undefined;
    setMapCenter: (val: { lat: number; lng: number } | undefined) => void;
    rooms: RoomSearchResultDTO[];
}

export const RoomsResultsMapViewMobile = ({
    filters,
    setters,
    setViewMode,
    mapCenter,
    setMapCenter,
    rooms,
}: RoomsResultsMapViewMobileProps) => {
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
        <div className="block fixed inset-0 z-50 bg-background">
            {/* Map View Header */}
            <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
                <div className="container mx-auto px-4 py-4">
                    {/* Mobile Layout */}
                    <div className="pointer-events-auto">
                        {/* Top Row: Search + Filter */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1 bg-background/80 backdrop-blur-md rounded-full shadow-sm border border-border/50 flex items-center px-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewMode("list")}
                                    className="h-8 w-8 rounded-full hover:bg-secondary/80 shrink-0"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <LocationAutocomplete
                                    value={location}
                                    onChange={handleLocationChange}
                                    placeholder="Search..."
                                    className="h-10 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                                />
                            </div>

                            {/* Reusing the same Sheet for mobile */}
                            <SearchFilters
                                urgency={urgency}
                                setUrgency={setUrgency}
                                roomTypes={roomTypes}
                                setRoomTypes={setRoomTypes}
                                bhkTypes={bhkTypes}
                                setBhkTypes={setBhkTypes}
                                propertyTypes={propertyTypes}
                                setPropertyTypes={setPropertyTypes}
                                amenities={amenities}
                                setAmenities={setAmenities}
                                trigger={
                                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-md border-border/50 shadow-sm hover:bg-background/90 shrink-0">
                                        <SlidersHorizontal className="h-4 w-4" />
                                    </Button>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Vertical Slider on the Right */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 pointer-events-auto">
                <div className="flex flex-col items-center gap-2 h-[50vh]">
                    {/* Max Value Label */}
                    <span className="text-sm font-bold text-black">100</span>

                    <div className="flex-1 w-full flex justify-center py-2">
                        <MapRadiusSlider
                            value={radius}
                            onChange={setRadius}
                            onCommit={(val) => {
                                if (placeId) handleLocationChange(location, placeId);
                            }}
                            min={0.5}
                            max={100}
                            step={0.5}
                            orientation="vertical"
                        />
                    </div>

                    {/* Min Value Label */}
                    <span className="text-sm font-bold text-black">0.5</span>
                </div>
            </div>

            {/* Full Screen Map */}
            <div className="h-full w-full">
                <GoogleMap
                    center={mapCenter}
                    listings={rooms}
                    onCenterChange={setMapCenter}
                    showMovablePin={true}
                    radiusKm={radius}
                    fullscreenControl={false}
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
