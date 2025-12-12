import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowUpDown, Map as MapIcon, SlidersHorizontal, List as ListIcon, Search } from "lucide-react";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { SearchFilters } from "./SearchFilters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { SearchFilters as SearchFiltersType } from "@/hooks/useSearchFilters";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface RoomsResultsHeaderProps {
    filters: SearchFiltersType;
    setters: any;
    viewMode: "list" | "map";
    setViewMode: (val: "list" | "map") => void;
    totalElements: number;
    isLoading: boolean;
}

export const RoomsResultsHeader = ({
    filters,
    setters,
    viewMode,
    setViewMode,
    totalElements,
    isLoading,
}: RoomsResultsHeaderProps) => {
    const isMobile = useIsMobile();
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

    // Budget range state handling
    const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 100000]); // Default max 1L

    useEffect(() => {
        const min = minPrice ? parseInt(minPrice) : 0;
        const max = maxPrice ? parseInt(maxPrice) : 100000;
        setBudgetRange([min, max]);
    }, [minPrice, maxPrice]);

    const handleBudgetChange = (value: number[]) => {
        setBudgetRange([value[0], value[1]]);
    };

    const handleBudgetCommit = (min: string, max: string) => {
        setMinPrice(min);
        setMaxPrice(max);
    };

    if (isMobile) {
        return (
            <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border/60 shadow-sm transition-all duration-200">
                <div className="container mx-auto px-4 py-3 space-y-3">
                    {/* Row 1: Location Search */}
                    <div className="w-full">
                        <LocationAutocomplete
                            value={location}
                            onChange={handleLocationChange}
                            placeholder="Search location..."
                            className="h-11 text-base shadow-sm border-muted-foreground/20 rounded-full bg-card"
                        />
                    </div>

                    {/* Row 2: Controls */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {/* Filters including Budget */}
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
                            // Pass budget props to renderer inside sheet
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            setMinPrice={setMinPrice}
                            setMaxPrice={setMaxPrice}
                            priceType={priceType}
                            setPriceType={setPriceType}
                            trigger={
                                <Button variant="outline" size="sm" className="h-9 rounded-full border-border bg-card shadow-sm hover:bg-accent/50 text-xs font-medium">
                                    <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                                    Filters
                                </Button>
                            }
                        />

                        <div className="flex-1" />

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-9 w-auto min-w-[100px] text-xs rounded-full border-border bg-card shadow-sm hover:bg-accent/50">
                                <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="price-low">Price low-high</SelectItem>
                                <SelectItem value="price-high">Price high-low</SelectItem>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="relevant">Relevant</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
                            className="h-9 rounded-full px-4 shadow-sm"
                        >
                            {viewMode === "list" ? <MapIcon className="h-3.5 w-3.5 mr-1.5" /> : <ListIcon className="h-3.5 w-3.5 mr-1.5" />}
                            {viewMode === "list" ? "Map" : "List"}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Desktop View
    return (
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/60 shadow-sm transition-all duration-200">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center gap-4">
                    {/* 1. Search Bar */}
                    <div className="w-[320px] shrink-0">
                        <LocationAutocomplete
                            value={location}
                            onChange={handleLocationChange}
                            placeholder="Search location..."
                            className="h-11 shadow-sm border-2 border-muted/20 focus-visible:ring-0 focus-visible:border-primary/50 text-base rounded-full bg-card transition-all"
                        />
                    </div>

                    {/* 2. Map View Toggle (Icon Only) */}
                    <Button
                        variant={viewMode === "map" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
                        className={`h-11 w-11 rounded-full shrink-0 transition-all ${viewMode === "list"
                            ? "bg-card border-2 border-muted/20 hover:border-primary/50 shadow-sm"
                            : "shadow-md"
                            }`}
                        title={viewMode === "list" ? "Switch to Map View" : "Switch to List View"}
                    >
                        {viewMode === "list" ? <MapIcon className="h-5 w-5" /> : <ListIcon className="h-5 w-5" />}
                    </Button>

                    <div className="flex-1 flex items-center gap-3 overflow-x-auto scrollbar-hide px-2">

                        {/* 3. Radius Selector */}
                        <div className="flex items-center gap-1.5 bg-card px-3 py-0 h-11 rounded-full border-2 border-muted/20 shadow-sm shrink-0 hover:border-primary/30 transition-colors group focus-within:border-primary/50">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground/70 tracking-widest">Radius</span>
                            <div className="h-4 w-[1px] bg-border mx-1" />
                            <div className="flex items-center gap-1">
                                <Input
                                    type="number"
                                    className="h-7 w-12 px-1 text-center bg-transparent border-transparent hover:bg-muted/50 focus:bg-background focus:border-input text-sm font-bold p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all rounded-sm"
                                    value={radius}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        setRadius(Math.min(100, Math.max(1, val)));
                                    }}
                                    onBlur={() => {
                                        if (placeId) {
                                            handleLocationChange(location, placeId);
                                        }
                                    }}
                                />
                                <span className="text-sm font-medium text-muted-foreground">km</span>
                            </div>
                        </div>

                        {/* 4. Budget Filter */}
                        <div className="flex items-center gap-2 bg-card px-4 py-0 h-11 rounded-full border-2 border-muted/20 shadow-sm shrink-0 hover:border-primary/30 transition-colors group focus-within:border-primary/50">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground/70 tracking-widest">Budget</span>

                            <div className="h-4 w-[1px] bg-border mx-1" />

                            {/* Min Input */}
                            <div className="flex items-center gap-0.5">
                                <span className="text-muted-foreground text-xs font-medium">₹</span>
                                <Input
                                    className="h-7 w-14 px-1 text-center bg-transparent border-transparent hover:bg-muted/50 focus:bg-background focus:border-input text-sm font-bold p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all rounded-sm"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    placeholder="Min"
                                />
                            </div>

                            <span className="text-muted-foreground">-</span>

                            {/* Max Input */}
                            <div className="flex items-center gap-0.5">
                                <span className="text-muted-foreground text-xs font-medium">₹</span>
                                <Input
                                    className="h-7 w-14 px-1 text-center bg-transparent border-transparent hover:bg-muted/50 focus:bg-background focus:border-input text-sm font-bold p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all rounded-sm"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    placeholder="Max"
                                />
                            </div>
                        </div>

                        {/* 5. Additional Filters (Icon Only) */}
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
                                <Button variant="outline" size="icon" className="h-11 w-11 rounded-full border-2 border-muted/20 bg-card shadow-sm shrink-0 hover:border-primary/30 transition-all group" title="More Filters">
                                    <SlidersHorizontal className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </Button>
                            }
                        />
                    </div>

                    {/* Sort (Icon Only) */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="h-11 w-11 rounded-full border-2 border-muted/20 bg-card shadow-sm hover:border-primary/30 transition-all focus:ring-0 p-0 flex items-center justify-center [&>span]:hidden" title="Sort Results">
                            <ArrowUpDown className="h-5 w-5 text-muted-foreground" />
                        </SelectTrigger>
                        <SelectContent align="end" className="w-[200px]">
                            <SelectItem value="price-low">Price: Low to High</SelectItem>
                            <SelectItem value="price-high">Price: High to Low</SelectItem>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="relevant">Most Relevant</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};
