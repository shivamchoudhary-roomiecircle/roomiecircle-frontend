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
import { AMENITY_GROUPS } from "@/constants/ui-constants";

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

    const renderFilterSection = <T extends string | number>(
        title: string,
        items: T[],
        selectedItems: T[],
        onChange: (items: T[]) => void,
        formatLabel?: (item: T) => string
    ) => (
        <div className="space-y-4">
            <Label className="text-base font-semibold text-foreground/90">{title}</Label>
            <div className="flex flex-wrap gap-2.5">
                {items.map((item) => {
                    const isSelected = selectedItems.includes(item);
                    return (
                        <div
                            key={item}
                            onClick={() => {
                                if (isSelected) {
                                    onChange(selectedItems.filter((i) => i !== item));
                                } else {
                                    onChange([...selectedItems, item]);
                                }
                            }}
                            className={`
                                cursor-pointer px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border select-none
                                ${isSelected
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : "bg-background text-muted-foreground border-muted hover:border-foreground/20 hover:bg-accent/50"
                                }
                            `}
                        >
                            {formatLabel ? formatLabel(item) : String(item)}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <Sheet>
            <SheetTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="h-10 rounded-full border-muted/40 hover:bg-accent/50">
                        <Plus className="h-4 w-4 mr-2" />
                        Filters
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="ml-2 h-5 px-1.5 rounded-full text-[10px] bg-primary/10 text-primary">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="overflow-y-auto w-full sm:max-w-[540px] p-0 gap-0">
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b">
                    <SheetTitle className="text-xl">Filters</SheetTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
                        onClick={handleClearAll}
                    >
                        Clear All
                    </Button>
                </div>

                <div className="px-6 py-6 pb-24 space-y-8">

                    {/* Budget Filter (Mobile) */}
                    {setMinPrice && setMaxPrice && (
                        <div className="space-y-4">
                            <Label className="text-base font-semibold text-foreground/90">Budget</Label>
                            <div className="p-4 rounded-xl border bg-card/50 space-y-4">
                                <div className="flex gap-2">
                                    <Select value={priceType || "monthly"} onValueChange={setPriceType}>
                                        <SelectTrigger className="w-full bg-background border-muted/60 h-10 rounded-lg">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monthly">Monthly Rent</SelectItem>
                                            <SelectItem value="target">Target Limit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                                        <Input
                                            type="number"
                                            className="pl-7 bg-background border-muted/60 h-10 rounded-lg"
                                            placeholder="Min"
                                            value={minPrice || ''}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                        />
                                    </div>
                                    <span className="text-muted-foreground font-medium">-</span>
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                                        <Input
                                            type="number"
                                            className="pl-7 bg-background border-muted/60 h-10 rounded-lg"
                                            placeholder="Max"
                                            value={maxPrice || ''}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <Separator className="my-6" />
                        </div>
                    )}

                    {/* Urgency */}
                    <div className="space-y-4">
                        <Label className="text-base font-semibold text-foreground/90">Move-in Date</Label>
                        <Select
                            value={urgency || "any"}
                            onValueChange={(val) => setUrgency(val === "any" ? undefined : val as Urgency)}
                        >
                            <SelectTrigger className="w-full h-11 rounded-xl bg-background border-muted/60 hover:border-primary/40 transition-colors">
                                <SelectValue placeholder="When do you want to move in?" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">Anytime</SelectItem>
                                <SelectItem value={Urgency.IMMEDIATE}>Immediately</SelectItem>
                                <SelectItem value={Urgency.WITHIN_1_WEEK}>Within 1 Week</SelectItem>
                                <SelectItem value={Urgency.WITHIN_1_MONTH}>Within 1 Month</SelectItem>
                                <SelectItem value={Urgency.FLEXIBLE}>Flexible</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    {/* Room Type */}
                    {renderFilterSection(
                        "Room Type",
                        Object.values(RoomType) as RoomType[],
                        roomTypes,
                        setRoomTypes,
                        (t) => t.replace(/_/g, ' ')
                    )}

                    <Separator />

                    {/* BHK configuration */}
                    {renderFilterSection(
                        "BHK Configuration",
                        Object.values(BhkType) as BhkType[],
                        bhkTypes,
                        setBhkTypes,
                        (t) => t.replace(/_/g, ' ')
                    )}

                    <Separator />

                    {/* Property Type */}
                    {renderFilterSection(
                        "Property Type",
                        Object.values(PropertyType) as PropertyType[],
                        propertyTypes,
                        setPropertyTypes,
                        (t) => t.replace(/_/g, ' ')
                    )}

                    <Separator />

                    {/* Amenities - Grouped */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">Amenities</Label>
                        </div>

                        {Object.entries(AMENITY_GROUPS).map(([groupTitle, items]) => {
                            // Correctly formatting the group title: IN_ROOM -> In Room
                            const displayTitle = groupTitle.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') + " Amenities";
                            return (
                                <div key={groupTitle} className="space-y-3">
                                    <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-[11px]">{displayTitle}</Label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {items.map((uiConfig) => {
                                            const itemValue = uiConfig.value as Amenity;
                                            const isSelected = amenities.includes(itemValue);
                                            return (
                                                <div
                                                    key={itemValue}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setAmenities(amenities.filter((a) => a !== itemValue));
                                                        } else {
                                                            setAmenities([...amenities, itemValue]);
                                                        }
                                                    }}
                                                    className={`
                                                        cursor-pointer px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border select-none flex items-center gap-2
                                                        ${isSelected
                                                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                            : "bg-background text-muted-foreground border-muted hover:border-foreground/20 hover:bg-accent/50"
                                                        }
                                                    `}
                                                >
                                                    {/* We could add icons here if available in AMENITY_UI */}
                                                    {uiConfig.label}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>

                {/* Footer with Apply button (Mobile sticky) */}
                <div className="sticky bottom-0 border-t bg-background p-4 flex justify-between items-center z-10">
                    <div className="text-sm text-muted-foreground font-medium">
                        {activeFiltersCount > 0 ? `${activeFiltersCount} filters active` : "No filters active"}
                    </div>
                    <SheetTrigger asChild>
                        <Button className="rounded-full px-8 font-semibold">
                            Show Results
                        </Button>
                    </SheetTrigger>
                </div>
            </SheetContent>
        </Sheet>
    );
};
