import { useNavigate } from "react-router-dom";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IndianRupee, ArrowUpDown, Map as MapIcon, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PremiumSlider } from "@/components/ui/PremiumSlider";
import { PropertyCard } from "@/components/shared/PropertyCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchFilters } from "./SearchFilters";
import { RoomSearchResultDTO } from "@/types/api.types";
import { SearchFilters as SearchFiltersType } from "@/hooks/useSearchFilters";

interface RoomsResultsListViewMobileProps {
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

export const RoomsResultsListViewMobile = ({
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
}: RoomsResultsListViewMobileProps) => {
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
        <div className="block pb-20">
            {/* Results Count & Sort */}
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        {isLoading ? "Loading..." : `${totalElements} rooms`}
                    </p>
                </div>
            </div>

            {/* Results Grid - Single Column for Mobile */}
            <div className="container mx-auto px-4 pb-4">
                {!isLoading && rooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <Search className="w-16 h-16 text-muted-foreground/40 mb-4" strokeWidth={1} />
                        <h2 className="text-xl font-semibold text-muted-foreground mb-2">No results</h2>
                        <p className="text-center text-sm text-muted-foreground">
                            Try expanding the search area
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-3">
                            {rooms.map((room: RoomSearchResultDTO) => (
                                <PropertyCard
                                    key={room.id}
                                    id={room.id}
                                    images={room.photos?.map(p => ({ url: p.url })) || []}
                                    price={room.monthlyRent}
                                    address={room.address || "Location not available"}
                                    onClick={() => navigate(`/listings/${room.id}`, { state: { previewImage: room.photos?.[0]?.url } })}
                                    isWishlisted={wishlistedRoomIds.has(room.id)}
                                    onToggleWishlist={(e) => {
                                        e.stopPropagation();
                                        onToggleWishlist(room.id);
                                    }}
                                >
                                    <div className="flex flex-col gap-1.5 mt-1">
                                        <div className="flex items-center gap-1.5 text-xs font-medium">
                                            <span>
                                                {room.bhkType === 0 ? "RK" : `${room.bhkType} BHK`}
                                            </span>
                                            <span className="text-muted-foreground">•</span>
                                            <span className="text-muted-foreground capitalize">
                                                {room.roomType?.toLowerCase().replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {room.propertyTypes?.slice(0, 2).map((pt, i) => (
                                                <Badge key={i} variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-border/60 bg-secondary/30">
                                                    {pt.replace(/_/g, ' ').toLowerCase()}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </PropertyCard>
                            ))}

                            {/* Loading Skeletons */}
                            {(isLoading || isFetchingNextPage) && (
                                Array.from({ length: 3 }).map((_, i) => (
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
