import React, { useMemo } from 'react';
import { AMENITY_GROUPS } from "@/constants/ui-constants";
import { Label } from "@/components/ui/label";
import { MultiSelectGroup } from "@/components/create-listing/shared/ListingFormComponents";
import { useFormContext } from "react-hook-form";
import { ListingFormData } from "@/schemas/listingSchema";

export function StepAmenities() {
    const { watch, setValue } = useFormContext<ListingFormData>();

    // We watch all fields to construct the unified "selected values" array for the UI
    const amenities = watch("amenities") || [];

    // Construct current selected values for the UI
    const currentSelectedValues = useMemo(() => {
        return [...amenities];
    }, [amenities]);

    // Handle changes
    const handleGroupChange = (groupValues: string[], allGroupOptions: any[]) => {
        // 1. Identify which values belong to THIS group's options
        const thisGroupOptionValues = allGroupOptions.map(o => o.value);

        // 2. Separate selected values
        // We only care about string amenities now
        const newStringAmenitiesSelected = groupValues;

        // 3. Update String Amenities
        // We need to keep string amenities from OTHER groups, and update ones for THIS group
        const currentStringAmenities = [...amenities];
        const otherGroupStringAmenities = currentStringAmenities.filter(v => !thisGroupOptionValues.includes(v));

        const finalStringAmenities = [...otherGroupStringAmenities, ...newStringAmenitiesSelected];
        setValue("amenities", finalStringAmenities, { shouldDirty: true });
    };

    const formatCategoryLabel = (key: string): string => {
        const formatted = key
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('-');
        return `${formatted} Amenities`;
    };

    return (
        <div className="h-full flex flex-col gap-3">
            <div className="space-y-1.5 shrink-0">
                {Object.entries(AMENITY_GROUPS).map(([categoryKey, options]) => {
                    if (!options || options.length === 0) return null;

                    return (
                        <div key={categoryKey} className="space-y-1.5 shrink-0">
                            <Label className="text-sm font-semibold">
                                {formatCategoryLabel(categoryKey)}
                            </Label>
                            <MultiSelectGroup
                                options={options as any[]}
                                selectedValues={currentSelectedValues}
                                onChange={(vals) => handleGroupChange(vals, options)}
                                limit={5}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
