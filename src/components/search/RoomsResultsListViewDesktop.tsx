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

interface RoomsResultsListViewDesktopProps {
    filters: SearchFiltersType;
    setters: any;
    setViewMode: (val: "list" | "map") => void;
    isLoading: boolean;
    totalElements: number;
    rooms: RoomSearchResultDTO[];
    observerTarget: React.RefObject<HTMLDivElement>;
    isFetchingNextPage: boolean;
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
            {/* Search Bar */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border shadow-sm transition-all duration-200">
                <div className="container mx-auto px-4 py-4 space-y-4">
                    {/* Row 1: Location Search */}
                    <div className="w-full max-w-3xl mx-auto">
                        <LocationAutocomplete
                            value={location}
                            onChange={handleLocationChange}
                            placeholder="Search by city, neighborhood, or address..."
                            className="h-12 text-lg shadow-sm border-muted-foreground/20 focus-visible:ring-primary/20"
                        />
                    </div>

                    {/* Row 2: Filters */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="h-10 rounded-full border-dashed border-muted-foreground/40 hover:border-primary/50 hover:bg-secondary/50">
                                    <IndianRupee className="h-4 w-4 mr-2 text-muted-foreground" />
                                    {priceType === "monthly" ? "Monthly" : "Target"}
                                    {(minPrice || maxPrice) && (
                                        <span className="ml-2 font-medium text-foreground">
                                            {minPrice && `₹${parseInt(minPrice).toLocaleString('en-IN')}`}{minPrice && maxPrice && "-"}{maxPrice && `₹${parseInt(maxPrice).toLocaleString('en-IN')}`}
                                        </span>
                                    )}
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

                        <div className="h-8 w-px bg-border mx-1 block" />

                        {/* Integrated Radius Slider */}
                        <div className="flex items-center gap-3 bg-secondary/30 px-4 py-2 rounded-full border border-border/50">
                            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap uppercase tracking-wider">Radius</span>
                            <div className="w-[140px]">
                                <PremiumSlider
                                    value={radius}
                                    onChange={setRadius}
                                    onCommit={(val) => {
                                        if (placeId) {
                                            handleLocationChange(location, placeId);
                                        }
                                    }}
                                    min={1}
                                    max={50}
                                />
                            </div>
                            <span className="text-sm font-semibold min-w-[3rem] text-right">{radius} km</span>
                        </div>

                        <div className="flex-1" />

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

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-10 w-[140px] rounded-full">
                                <ArrowUpDown className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="price-low">Price: Low to High</SelectItem>
                                <SelectItem value="price-high">Price: High to Low</SelectItem>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="relevant">Most Relevant</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="default"
                            onClick={() => setViewMode("map")}
                            className="h-10 rounded-full px-6 shadow-md hover:shadow-lg transition-all"
                        >
                            <MapIcon className="h-4 w-4 mr-2" />
                            Map View
                        </Button>
                    </div>
                </div>
            </div>

            {/* Results Count */}
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
                                <RoomSearchCard
                                    key={room.id}
                                    room={room}
                                    onClick={() => navigate(`/listings/${room.id}`)}
                                />
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
