import React, { useMemo } from 'react';
import { useConfig } from "@/contexts/ConfigContext";
import { Label } from "@/components/ui/label";
import { SingleSelectOption, MultiSelectGroup, OptionItem } from "@/components/create-listing/shared/ListingFormComponents";

interface StepAmenitiesProps {
    formData: any;
    onChange: (field: string, value: any) => void;
}

export function StepAmenities({ formData, onChange }: StepAmenitiesProps) {
    const { config } = useConfig();

    // Combine all amenities and features into one list for the MultiSelectGroup
    const allAmenitiesOptions = useMemo(() => {
        const options: OptionItem[] = [];

        // Add Key Features
        options.push({ label: "Gated Society", value: "Gated Society" }); // Example hardcoded
        options.push({ label: "Private Bath", value: "Private Bath" });
        options.push({ label: "Balcony", value: "Balcony" });
        options.push({ label: "Furnished", value: "Furnished" });

        // Add Config Amenities - dynamically iterate over all categories
        if (config?.amenities) {
            Object.values(config.amenities).forEach((categoryItems) => {
                options.push(...categoryItems);
            });
        }

        // Remove duplicates based on value
        return options.filter((v, i, a) => a.findIndex(t => t.value === v.value) === i);
    }, [config]);
    // Helper to handle changes across all groups
    const handleAmenitiesChange = (newValues: string[]) => {
        // Separate out the "Key Features" booleans
        // We check if the new list includes these specific values
        const hasPrivateWashroom = newValues.includes("Private Bath");
        const hasBalcony = newValues.includes("Balcony");
        const hasFurniture = newValues.includes("Furnished");

        // Update booleans
        onChange("hasPrivateWashroom", hasPrivateWashroom);
        onChange("hasBalcony", hasBalcony);
        onChange("hasFurniture", hasFurniture);

        // Filter out the boolean-mapped values from the amenities array if we want to keep them separate in formData.amenities
        // The previous logic seemed to imply they might be separate.
        // However, usually if it's in the list, it's in the list.
        // But let's stick to the previous behavior:
        // "Private Bath", "Balcony", "Furnished" are NOT stored in formData.amenities string array, but as booleans.
        const booleanKeys = ["Private Bath", "Balcony", "Furnished"];
        const stringAmenities = newValues.filter(v => !booleanKeys.includes(v));

        onChange("amenities", stringAmenities);
    };

    // Construct current selected values for the UI (merging booleans back into the list for display)
    const currentSelectedValues = useMemo(() => {
        const selected = [...(formData.amenities || [])];
        if (formData.hasPrivateWashroom) selected.push("Private Bath");
        if (formData.hasBalcony) selected.push("Balcony");
        if (formData.hasFurniture) selected.push("Furnished");
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

    return (
        <div className="space-y-10">
            {/* Gender Section */}
            <div className="space-y-4">
                <Label className="text-xl font-semibold">Gender:</Label>
                <div className="flex gap-4">
                    <SingleSelectOption
                        label="Male"
                        value="Male"
                        selected={formData.gender === "Male"}
                        onClick={() => onChange("gender", "Male")}
                    />
                    <SingleSelectOption
                        label="Female"
                        value="Female"
                        selected={formData.gender === "Female"}
                        onClick={() => onChange("gender", "Female")}
                    />
                    <SingleSelectOption
                        label="Any"
                        value="Any"
                        selected={formData.gender === "Any"}
                        onClick={() => onChange("gender", "Any")}
                    />
                </div>
            </div>

            {/* In-Home Amenities */}
            {config?.amenities?.in_home && config.amenities.in_home.length > 0 && (
                <div className="space-y-4">
                    <Label className="text-xl font-semibold">In-Home Amenities</Label>
                    <MultiSelectGroup
                        options={config.amenities.in_home}
                        selectedValues={currentSelectedValues}
                        onChange={(vals) => handleGroupChange(vals, config.amenities.in_home)}
                        limit={10}
                    />
                </div>
            )}

            {/* On-Property Amenities */}
            {config?.amenities?.on_property && config.amenities.on_property.length > 0 && (
                <div className="space-y-4">
                    <Label className="text-xl font-semibold">On-Property Amenities</Label>
                    <MultiSelectGroup
                        options={config.amenities.on_property}
                        selectedValues={currentSelectedValues}
                        onChange={(vals) => handleGroupChange(vals, config.amenities.on_property)}
                        limit={10}
                    />
                </div>
            )}

            {/* Safety Amenities */}
            {config?.amenities?.safety && config.amenities.safety.length > 0 && (
                <div className="space-y-4">
                    <Label className="text-xl font-semibold">Safety Amenities</Label>
                    <MultiSelectGroup
                        options={config.amenities.safety}
                        selectedValues={currentSelectedValues}
                        onChange={(vals) => handleGroupChange(vals, config.amenities.safety)}
                        limit={10}
                    />
                </div>
            )}
        </div>
    );
}

