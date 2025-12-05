import React from 'react';
import { useConfig } from "@/contexts/ConfigContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SingleSelectOption, MultiSelectGroup, MultiSelectChip } from "@/components/create-listing/shared/ListingFormComponents";
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
                <Label htmlFor="bhkType" className="text-xl font-semibold">BHK Type</Label>
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
                        className="h-14 text-lg px-4 pr-20 rounded-xl border-2"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-gray-500 pointer-events-none">
                        BHK
                    </span>
                </div>
                <p className="text-sm text-muted-foreground">
                    Use 0 for RK (Room Kitchen), 1 for 1BHK, 2 for 2BHK, etc.
                </p>
            </div>

            {/* Property Type */}
            <div className="space-y-4">
                <Label className="text-xl font-semibold">Property Type</Label>
                <div className="flex flex-wrap gap-3">
                    {/* None option - inline with other options */}
                    <MultiSelectChip
                        label="None"
                        value="__NONE__"
                        selected={(formData.propertyType || []).length === 0}
                        onClick={() => onChange("propertyType", [])}
                    />

                    {/* Regular property type options */}
                    {config?.propertyTypes?.map((type) => (
                        <MultiSelectChip
                            key={type.value}
                            label={type.label}
                            value={type.value}
                            symbol={type.symbol}
                            selected={(formData.propertyType || []).includes(type.value)}
                            onClick={() => {
                                const current = formData.propertyType || [];
                                const updated = current.includes(type.value)
                                    ? current.filter((v) => v !== type.value)
                                    : [...current, type.value];
                                onChange("propertyType", updated);
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
