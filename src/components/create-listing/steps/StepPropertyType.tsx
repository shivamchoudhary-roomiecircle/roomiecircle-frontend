import React from 'react';
import { useConfig } from "@/contexts/ConfigContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SingleSelectOption, MultiSelectGroup, MultiSelectChip, SingleSelectGroup } from "@/components/create-listing/shared/ListingFormComponents";
import { cn } from "@/lib/utils";

interface StepPropertyTypeProps {
    formData: any;
    onChange: (field: string, value: any) => void;
}

export function StepPropertyType({ formData, onChange }: StepPropertyTypeProps) {
    const { config } = useConfig();

    return (
        <div className="h-full flex flex-col gap-3">
            {/* Room Type */}
            <div className="space-y-1.5 shrink-0">
                <Label className="text-sm font-semibold">Room Type</Label>
                <SingleSelectGroup
                    options={config?.roomTypes || []}
                    selectedValue={formData.roomType}
                    onChange={(value) => onChange("roomType", value)}
                    limit={5}
                />
            </div>

            {/* BHK Type */}
            <div className="space-y-1 shrink-0">
                <Label htmlFor="bhkType" className="text-sm font-semibold">BHK Type</Label>
                <div className="relative">
                    <Input
                        id="bhkType"
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="0"
                        max="20"
                        placeholder="0"
                        value={formData.bhkType}
                        onChange={(e) => onChange("bhkType", e.target.value)}
                        className="h-10 text-sm px-3 pr-12 rounded-lg border"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                        BHK
                    </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                    Use 0 for RK (Room Kitchen), 1 for 1BHK, 2 for 2BHK, etc.
                </p>
            </div>

            {/* Property Type */}
            <div className="space-y-1.5 shrink-0">
                <Label className="text-sm font-semibold">Property Type</Label>
                <MultiSelectGroup
                    options={[
                        { label: "None", value: "__NONE__" },
                        ...(config?.propertyTypes || [])
                    ]}
                    selectedValues={
                        (formData.propertyType || []).length === 0
                            ? ["__NONE__"]
                            : formData.propertyType || []
                    }
                    onChange={(values) => {
                        // If "None" is selected, clear the array
                        if (values.includes("__NONE__")) {
                            const currentEmpty = (formData.propertyType || []).length === 0;
                            if (!currentEmpty) {
                                // None was just selected, clear everything
                                onChange("propertyType", []);
                            } else {
                                // None was already selected and something else was clicked, remove None
                                const filtered = values.filter(v => v !== "__NONE__");
                                onChange("propertyType", filtered);
                            }
                        } else {
                            onChange("propertyType", values);
                        }
                    }}
                    limit={5}
                />
            </div>
        </div>
    );
}
