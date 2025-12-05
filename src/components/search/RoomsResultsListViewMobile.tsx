import { useNavigate } from "react-router-dom";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IndianRupee, ArrowUpDown, Map as MapIcon, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PremiumSlider } from "@/components/ui/PremiumSlider";
import { RoomSearchCard } from "@/components/search/RoomSearchCard.tsx";
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
            {/* Search Bar - Mobile Optimized */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border shadow-sm">
                <div className="container mx-auto px-4 py-3 space-y-3">
                    {/* Row 1: Location Search */}
                    <div className="w-full">
                        <LocationAutocomplete
                            value={location}
                            onChange={handleLocationChange}
                            placeholder="Search location..."
                            className="h-10 text-base shadow-sm border-muted-foreground/20"
                        />
                    </div>

                    {/* Row 2: Compact Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 rounded-full border-dashed">
                                    <IndianRupee className="h-3 w-3 mr-1" />
                                    Price
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <Button
                                            variant={priceType === "monthly" ? "default" : "outline"}
                                            onClick={() => setPriceType("monthly")}
                                            className="flex-1"
                                        >
                                            Monthly
                                        </Button>
                                        <Button
                                            variant={priceType === "target" ? "default" : "outline"}
                                            onClick={() => setPriceType("target")}
                                            className="flex-1"
                                        >
                                            Target
                                        </Button>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Min"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            type="number"
                                        />
                                        <Input
                                            placeholder="Max"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            type="number"
                                        />
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

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
                        />

                        <div className="flex-1" />

                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => setViewMode("map")}
                            className="h-9 rounded-full px-4"
                        >
                            <MapIcon className="h-3 w-3 mr-1" />
                            Map
                        </Button>
                    </div>
                </div>
            </div>

            {/* Results Count & Sort */}
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        {isLoading ? "Loading..." : `${totalElements} rooms`}
                    </p>

                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="h-8 w-[110px] text-xs rounded-full border-none bg-secondary/50">
                            <ArrowUpDown className="h-3 w-3 mr-1" />
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="price-low">Price: Low to High</SelectItem>
                            <SelectItem value="price-high">Price: High to Low</SelectItem>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="relevant">Most Relevant</SelectItem>
                        </SelectContent>
                    </Select>
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
                        <div className="grid grid-cols-2 gap-3">
                            {rooms.map((room: RoomSearchResultDTO) => (
                                <RoomSearchCard
                                    key={room.id}
                                    room={room}
                                    onClick={() => navigate(`/listings/${room.id}`)}
                                />
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
