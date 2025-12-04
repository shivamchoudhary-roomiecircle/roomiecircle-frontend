import React from 'react';
import { useConfig } from "@/contexts/ConfigContext";
import { Label } from "@/components/ui/label";
import { SingleSelectOption, MultiSelectGroup } from "@/components/create-listing/shared/ListingFormComponents";
import { cn } from "@/lib/utils";

interface StepPropertyTypeProps {
    formData: any;
    onChange: (field: string, value: any) => void;
}

export function StepPropertyType({ formData, onChange }: StepPropertyTypeProps) {
    const { config } = useConfig();

    return (
        <div className="space-y-8">
            {/* Room Type */}
            <div className="space-y-4">
                <Label className="text-xl font-semibold">Room Type</Label>
                <div className="flex flex-wrap gap-4">
                    {config?.roomTypes?.map((type) => (
                        <SingleSelectOption
                            key={type.value}
                            label={type.label}
                            value={type.value}
                            symbol={type.symbol}
                            selected={formData.roomType === type.value}
                            onClick={() => onChange("roomType", type.value)}
                        />
                    ))}
                </div>
            </div>

            {/* BHK Type */}
            <div className="space-y-4">
                <Label className="text-xl font-semibold">BHK Type</Label>
                <div className="flex flex-wrap gap-4">
                    {config?.bhkTypes?.map((type) => (
                        <SingleSelectOption
                            key={type.value}
                            label={type.label}
                            value={type.value}
                            symbol={type.symbol}
                            selected={formData.bhkType === type.value}
                            onClick={() => onChange("bhkType", type.value)}
                        />
                    ))}
                </div>
            </div>

            {/* Property Type */}
            <div className="space-y-4">
                <Label className="text-xl font-semibold">Property Type</Label>
                <div className="flex flex-wrap gap-3">
                    {/* None option */}
                    <button
                        type="button"
                        onClick={() => onChange("propertyType", [])}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium",
                            (formData.propertyType || []).length === 0
                                ? "border-black bg-white text-black shadow-sm ring-1 ring-black"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        )}
                    >
                        None
                    </button>

                    {/* Regular property type options */}
                    <MultiSelectGroup
                        options={config?.propertyTypes || []}
                        selectedValues={formData.propertyType || []}
                        onChange={(values) => onChange("propertyType", values)}
                        limit={5}
                    />
                </div>
            </div>
        </div>
    );
}
