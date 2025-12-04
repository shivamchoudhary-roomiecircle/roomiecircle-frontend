import React from 'react';
import { useConfig } from "@/contexts/ConfigContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SingleSelectOption, MultiSelectGroup } from "@/components/create-listing/shared/ListingFormComponents";

interface StepPreferencesProps {
    formData: any;
    onChange: (field: string, value: any) => void;
}

export function StepPreferences({ formData, onChange }: StepPreferencesProps) {
    const { config } = useConfig();

    return (
        <div className="space-y-8">
            {/* Age Range */}
            <div className="space-y-4">
                <Label className="text-xl font-semibold">Age Range</Label>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <Input
                            type="number"
                            placeholder="Min"
                            value={formData.minAge}
                            onChange={(e) => onChange("minAge", e.target.value)}
                            className="h-14 text-center text-lg rounded-xl border-2"
                        />
                    </div>
                    <span className="text-muted-foreground font-medium">to</span>
                    <div className="flex-1">
                        <Input
                            type="number"
                            placeholder="Max"
                            value={formData.maxAge}
                            onChange={(e) => onChange("maxAge", e.target.value)}
                            className="h-14 text-center text-lg rounded-xl border-2"
                        />
                    </div>
                </div>
            </div>

            {/* Profession */}
            <div className="space-y-4">
                <Label className="text-xl font-semibold">Preferred Profession</Label>
                <div className="flex flex-wrap gap-4">
                    {config?.professions?.map((option) => (
                        <SingleSelectOption
                            key={option.value}
                            label={option.label}
                            value={option.value}
                            symbol={option.symbol}
                            selected={formData.profession === option.value}
                            onClick={() => onChange("profession", option.value)}
                        />
                    ))}
                </div>
            </div>

            {/* Lifestyle */}
            <div className="space-y-4">
                <Label className="text-xl font-semibold">Lifestyle</Label>
                <MultiSelectGroup
                    options={config?.lifestylePreferences || []}
                    selectedValues={formData.lifestyle || []}
                    onChange={(values) => onChange("lifestyle", values)}
                    limit={5}
                />
            </div>
        </div>
    );
}
