import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, SlidersHorizontal } from "lucide-react";
import { Urgency, PropertyType, RoomType, BhkType, Amenity } from "@/types/api.types";

interface SearchFiltersProps {
    urgency: Urgency | undefined;
    setUrgency: (val: Urgency | undefined) => void;
    roomTypes: RoomType[];
    setRoomTypes: (val: RoomType[]) => void;
    bhkTypes: BhkType[];
    setBhkTypes: (val: BhkType[]) => void;
    propertyTypes: PropertyType[];
    setPropertyTypes: (val: PropertyType[]) => void;
    amenities: Amenity[];
    setAmenities: (val: Amenity[]) => void;
    trigger?: React.ReactNode;
    // Budget props (optional, mainly for mobile filter sheet)
    minPrice?: string;
    maxPrice?: string;
    setMinPrice?: (val: string) => void;
    setMaxPrice?: (val: string) => void;
    priceType?: string;
    setPriceType?: (val: string) => void;
}

export const SearchFilters = ({
    urgency,
    setUrgency,
    roomTypes,
    setRoomTypes,
    bhkTypes,
    setBhkTypes,
    propertyTypes,
    setPropertyTypes,
    amenities,
    setAmenities,
    trigger,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    priceType,
    setPriceType,
}: SearchFiltersProps) => {

    const activeFiltersCount = roomTypes.length + bhkTypes.length + propertyTypes.length + amenities.length + (urgency ? 1 : 0);

    const handleClearAll = () => {
        setUrgency(undefined);
        setRoomTypes([]);
        setBhkTypes([]);
        setPropertyTypes([]);
        setAmenities([]);
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="h-10 rounded-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Filters
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="ml-2 h-5 px-1.5 rounded-full text-[10px]">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="overflow-y-auto w-full sm:max-w-md">
                <SheetHeader className="flex flex-row items-center justify-between space-y-0">
                    <SheetTitle>More Filters</SheetTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-2 text-muted-foreground hover:text-foreground"
                        onClick={handleClearAll}
                    >
                        Clear All
                    </Button>
                </SheetHeader>
                <div className="space-y-6 mt-6">

                    {/* Budget Filter - Only if props are provided (Mobile case) */}
                    {setMinPrice && setMaxPrice && (
                        <>
                            <div className="space-y-4">
                                <Label className="text-base font-medium">Budget Range</Label>
                                <div className="flex gap-2">
                                    <Select value={priceType || "monthly"} onValueChange={setPriceType}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monthly">Monthly Rent</SelectItem>
                                            <SelectItem value="target">Target Limit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={minPrice || ''}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                    />
                                    <span>-</span>
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={maxPrice || ''}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Urgency Filter */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Urgency</Label>
                        <Select
                            value={urgency || "any"}
                            onValueChange={(val) => setUrgency(val === "any" ? undefined : val as Urgency)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Any" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">Any</SelectItem>
                                <SelectItem value={Urgency.IMMEDIATE}>Immediate</SelectItem>
                                <SelectItem value={Urgency.WITHIN_1_WEEK}>Within 1 Week</SelectItem>
                                <SelectItem value={Urgency.WITHIN_1_MONTH}>Within 1 Month</SelectItem>
                                <SelectItem value={Urgency.FLEXIBLE}>Flexible</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    {/* Room Type Filter (Multi-select) */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Room Type</Label>
                        <div className="flex flex-wrap gap-2">
                            {(Object.values(RoomType) as RoomType[]).map((type) => {
                                const isSelected = roomTypes.includes(type);
                                return (
                                    <Badge
                                        key={type}
                                        variant={isSelected ? "default" : "outline"}
                                        className="cursor-pointer px-3 py-1.5 text-sm font-normal hover:bg-primary/90 hover:text-primary-foreground transition-colors"
                                        onClick={() => {
                                            if (isSelected) {
                                                setRoomTypes(roomTypes.filter(t => t !== type));
                                            } else {
                                                setRoomTypes([...roomTypes, type]);
                                            }
                                        }}
                                    >
                                        {type.replace(/_/g, ' ')}
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>

                    <Separator />

                    {/* BHK Type Filter (Multi-select) */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">BHK Type</Label>
                        <div className="flex flex-wrap gap-2">
                            {(Object.values(BhkType) as BhkType[]).map((type) => {
                                const isSelected = bhkTypes.includes(type);
                                return (
                                    <Badge
                                        key={type}
                                        variant={isSelected ? "default" : "outline"}
                                        className="cursor-pointer px-3 py-1.5 text-sm font-normal hover:bg-primary/90 hover:text-primary-foreground transition-colors"
                                        onClick={() => {
                                            if (isSelected) {
                                                setBhkTypes(bhkTypes.filter(t => t !== type));
                                            } else {
                                                setBhkTypes([...bhkTypes, type]);
                                            }
                                        }}
                                    >
                                        {type.replace(/_/g, ' ')}
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>

                    <Separator />

                    {/* Property Type Filter (Multi-select) */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Property Type</Label>
                        <div className="flex flex-wrap gap-2">
                            {(Object.values(PropertyType) as PropertyType[]).map((type) => {
                                const isSelected = propertyTypes.includes(type);
                                return (
                                    <Badge
                                        key={type}
                                        variant={isSelected ? "default" : "outline"}
                                        className="cursor-pointer px-3 py-1.5 text-sm font-normal hover:bg-primary/90 hover:text-primary-foreground transition-colors"
                                        onClick={() => {
                                            if (isSelected) {
                                                setPropertyTypes(propertyTypes.filter(t => t !== type));
                                            } else {
                                                setPropertyTypes([...propertyTypes, type]);
                                            }
                                        }}
                                    >
                                        {type.replace(/_/g, ' ')}
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>

                    <Separator />

                    {/* Amenities Filter (Multi-select) */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Amenities</Label>
                        <div className="grid grid-cols-1 gap-3">
                            {(Object.values(Amenity) as Amenity[]).map((item) => (
                                <div key={item} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`amenity-${item}`}
                                        checked={amenities.includes(item)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setAmenities([...amenities, item]);
                                            } else {
                                                setAmenities(amenities.filter((a) => a !== item));
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor={`amenity-${item}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {item.replace(/_/g, ' ')}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </SheetContent>
        </Sheet>
    );
};
