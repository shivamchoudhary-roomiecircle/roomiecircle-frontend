import { useNavigate } from "react-router-dom";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IndianRupee, ArrowUpDown, Map as MapIcon, Search, Heart } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PremiumSlider } from "@/components/ui/PremiumSlider";
import { PropertyCard } from "@/components/shared/PropertyCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchFilters } from "./SearchFilters";
import { RoomSearchResultDTO } from "@/types/api.types";
import { SearchFilters as SearchFiltersType } from "@/hooks/useSearchFilters";
import { useAuth } from "@/contexts/AuthContext";
import { wishlistApi } from "@/lib/api/wishlist";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";

interface RoomsResultsListViewDesktopProps {
    filters: SearchFiltersType;
    setters: any;
    setViewMode: (val: "list" | "map") => void;
    isLoading: boolean;
    totalElements: number;
    rooms: RoomSearchResultDTO[];
    observerTarget: React.RefObject<HTMLDivElement>;
    isFetchingNextPage: boolean;
    wishlistedRoomIds: Set<number>;
    onToggleWishlist: (id: number) => void;
}

export const RoomsResultsListViewDesktop = ({
    filters,
    setters,
    setViewMode,
    isLoading,
    totalElements,
    rooms,
    observerTarget,
    isFetchingNextPage,
    wishlistedRoomIds,
    onToggleWishlist,
}: RoomsResultsListViewDesktopProps) => {
    const {
        location,
        priceType,
        minPrice,
        maxPrice,
        radius,
        placeId,
        urgency,
        roomTypes,
        bhkTypes,
        propertyTypes,
        amenities,
        sortBy
    } = filters;

    const {
        handleLocationChange,
        setPriceType,
        setMinPrice,
        setMaxPrice,
        setRadius,
        setUrgency,
        setRoomTypes,
        setBhkTypes,
        setPropertyTypes,
        setAmenities,
        setSortBy,
        clearFilters: onClearFilters
    } = setters;

    const navigate = useNavigate();

    return (
        <div className="block pb-8">
            {/* Results Count & Grid */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {isLoading ? "Loading..." : `${totalElements} rooms`}
                    </p>
                    <Button variant="ghost" size="sm" onClick={onClearFilters}>
                        Clear filters
                    </Button>
                </div>
            </div>

            {/* Results Grid */}
            <div className="container mx-auto px-4 pb-12">
                {!isLoading && rooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="w-32 h-32 mb-6 flex items-center justify-center">
                            <Search className="w-20 h-20 text-muted-foreground/40" strokeWidth={1} />
                        </div>
                        <h2 className="text-2xl font-semibold text-muted-foreground mb-4">No results</h2>
                        <p className="text-center text-muted-foreground max-w-md">
                            Try expanding the search area, or connect with other renters that are also looking in your area
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {rooms.map((room: RoomSearchResultDTO) => (
                                <PropertyCard
                                    key={room.id}
                                    id={room.id}
                                    images={room.photos?.map(p => ({ url: p.url })) || []}
                                    price={room.monthlyRent}
                                    address={room.address || "Location not available"}
                                    onClick={() => navigate(`/listings/${room.id}`, { state: { previewImage: room.photos?.[0].url } })}
                                    isWishlisted={wishlistedRoomIds.has(room.id)}
                                    onToggleWishlist={(e) => {
                                        e.stopPropagation();
                                        onToggleWishlist(room.id);
                                    }}
                                // Move badges to children for custom layout inside card
                                >
                                    <div className="flex flex-col gap-2">
                                        {/* Badges Row */}
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 px-1.5 py-0.5 text-[10px]">
                                                {room.roomType === 'PRIVATE_ROOM' ? 'Private' : room.roomType === 'SHARED_ROOM' ? 'Shared' : room.roomType}
                                            </Badge>
                                            {room.bhkType !== null && (
                                                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 px-1.5 py-0.5 text-[10px]">
                                                    {room.bhkType === 0 ? "RK" : `${room.bhkType} BHK`}
                                                </Badge>
                                            )}
                                            {room.floor !== null && room.floor !== undefined && (
                                                <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200 px-1.5 py-0.5 text-[10px]">
                                                    {room.floor === 0 ? "Ground" : `${room.floor}th Floor`}
                                                </Badge>
                                            )}
                                        </div>
                                        {/* Property Types */}
                                        {room.propertyTypes && room.propertyTypes.length > 0 && (
                                            <div className="flex items-center gap-1 flex-wrap text-[10px] text-muted-foreground/80">
                                                {room.propertyTypes.slice(0, 2).map((pt, i) => (
                                                    <span key={i} className="bg-secondary/50 px-1.5 py-0.5 rounded border border-border/50">
                                                        {pt.replace(/_/g, ' ').toLowerCase()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </PropertyCard>
                            ))}

                            {/* Loading Skeletons */}
                            {(isLoading || isFetchingNextPage) && (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={`skeleton-${i}`} className="bg-card rounded-xl border border-border overflow-hidden">
                                        <Skeleton className="aspect-[4/3]" />
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="w-8 h-8 rounded-full" />
                                                <div className="space-y-1 flex-1">
                                                    <Skeleton className="h-3 w-20" />
                                                    <Skeleton className="h-2 w-16" />
                                                </div>
                                            </div>
                                            <Skeleton className="h-5 w-24" />
                                            <Skeleton className="h-3 w-full" />
                                            <Skeleton className="h-3 w-3/4" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Observer Target */}
                        <div ref={observerTarget} className="h-10 w-full" />
                    </>
                )}
            </div>
        </div>
    );
};
