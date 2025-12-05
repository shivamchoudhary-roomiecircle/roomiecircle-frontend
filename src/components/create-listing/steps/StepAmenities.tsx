import React, { useMemo } from 'react';
import { useConfig } from "@/contexts/ConfigContext";
import { Label } from "@/components/ui/label";
import { MultiSelectGroup } from "@/components/create-listing/shared/ListingFormComponents";

interface StepAmenitiesProps {
    formData: any;
    onChange: (field: string, value: any) => void;
}

export function StepAmenities({ formData, onChange }: StepAmenitiesProps) {
    const { config } = useConfig();

    // Keys for special boolean fields that map to formData booleans
    // These should match the API values from config (not display labels)
    const BOOLEAN_AMENITY_KEYS = {
        PRIVATE_BATH: 'hasPrivateWashroom',
        BALCONY: 'hasBalcony',
        FURNISHED: 'hasFurniture',
    } as const;

    // Helper to handle changes across all groups
    const handleAmenitiesChange = (newValues: string[]) => {
        // Update boolean fields based on whether their API keys are selected
        onChange("hasPrivateWashroom", newValues.includes("PRIVATE_BATH"));
        onChange("hasBalcony", newValues.includes("BALCONY"));
        onChange("hasFurniture", newValues.includes("FURNISHED"));

        // Filter out the boolean-mapped values from the amenities array
        // These are stored as separate boolean fields, not in the amenities array
        const booleanKeys = Object.keys(BOOLEAN_AMENITY_KEYS);
        const stringAmenities = newValues.filter(v => !booleanKeys.includes(v));

        onChange("amenities", stringAmenities);
    };

    // Construct current selected values for the UI (merging booleans back into the list for display)
    const currentSelectedValues = useMemo(() => {
        const selected = [...(formData.amenities || [])];
        // Add boolean fields back as their API key values for display
        if (formData.hasPrivateWashroom) selected.push("PRIVATE_BATH");
        if (formData.hasBalcony) selected.push("BALCONY");
        if (formData.hasFurniture) selected.push("FURNISHED");
        return selected;
    }, [formData]);


    // Wrapper for MultiSelectGroup to handle adding/removing from the global list
    const handleGroupChange = (groupValues: string[], allGroupOptions: any[]) => {
        // groupValues contains the selected values ONLY for this specific group (e.g. In-Home)

        // We need to reconstruct the FULL list of selected values across ALL groups.
        // 1. Get current global selected values
        const currentGlobal = [...currentSelectedValues];

        // 2. Identify which values belong to THIS group's options
        const thisGroupOptionValues = allGroupOptions.map(o => o.value);

        // 3. Remove ALL values belonging to this group from the global list
        const otherValues = currentGlobal.filter(v => !thisGroupOptionValues.includes(v));

        // 4. Add back the new selections for this group
        const newGlobal = [...otherValues, ...groupValues];

        handleAmenitiesChange(newGlobal);
    };

    // Helper to format category key to display label
    // e.g., "IN_ROOM" -> "In-Room Amenities", "in_room" -> "In Room Amenities"
    const formatCategoryLabel = (key: string): string => {
        // Handle both UPPER_CASE and snake_case keys
        const formatted = key
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('-');
        return `${formatted} Amenities`;
    };

    return (
        <div className="h-full flex flex-col gap-3">
            {/* Dynamically render all amenity categories from config */}
            {config?.amenities && Object.entries(config.amenities).map(([categoryKey, options]) => {
                if (!options || options.length === 0) return null;

                return (
                    <div key={categoryKey} className="space-y-1.5 shrink-0">
                        <Label className="text-sm font-semibold">
                            {formatCategoryLabel(categoryKey)}
                        </Label>
                        <MultiSelectGroup
                            options={options}
                            selectedValues={currentSelectedValues}
                            onChange={(vals) => handleGroupChange(vals, options)}
                            limit={5}
                        />
                    </div>
                );
            })}
        </div>
    );
}

