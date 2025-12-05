import React from 'react';
import { useConfig } from "@/contexts/ConfigContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SingleSelectOption, MultiSelectGroup, SingleSelectGroup } from "@/components/create-listing/shared/ListingFormComponents";

interface StepPreferencesProps {
    formData: any;
    onChange: (field: string, value: any) => void;
}

export function StepPreferences({ formData, onChange }: StepPreferencesProps) {
    const { config } = useConfig();

    return (
        <div className="h-full flex flex-col gap-3">
            {/* Gender Preference */}
            <div className="space-y-1.5 shrink-0">
                <Label className="text-sm font-semibold">Gender Preference</Label>
                <div className="flex flex-wrap gap-2">
                    <SingleSelectOption
                        label="Male"
                        value="MALE"
                        selected={formData.gender === "MALE"}
                        onClick={() => onChange("gender", "MALE")}
                    />
                    <SingleSelectOption
                        label="Female"
                        value="FEMALE"
                        selected={formData.gender === "FEMALE"}
                        onClick={() => onChange("gender", "FEMALE")}
                    />
                    <SingleSelectOption
                        label="Any"
                        value="ANY"
                        selected={formData.gender === "ANY"}
                        onClick={() => onChange("gender", "ANY")}
                    />
                </div>
            </div>
            {/* Age Range */}
            <div className="space-y-1.5 shrink-0">
                <Label className="text-sm font-semibold">Age Range</Label>
                <div className="flex items-center gap-2">
                    <div className="flex-1">
                        <Input
                            type="number"
                            placeholder="Min"
                            value={formData.minAge}
                            onChange={(e) => onChange("minAge", e.target.value)}
                            className="h-10 text-center text-sm rounded-lg border"
                        />
                    </div>
                    <span className="text-muted-foreground font-medium text-sm">to</span>
                    <div className="flex-1">
                        <Input
                            type="number"
                            placeholder="Max"
                            value={formData.maxAge}
                            onChange={(e) => onChange("maxAge", e.target.value)}
                            className="h-10 text-center text-sm rounded-lg border"
                        />
                    </div>
                </div>
            </div>

            {/* Profession */}
            <div className="space-y-1.5 shrink-0">
                <Label className="text-sm font-semibold">Preferred Profession</Label>
                <SingleSelectGroup
                    options={config?.professions || []}
                    selectedValue={formData.profession}
                    onChange={(value) => onChange("profession", value)}
                    limit={5}
                    dialogTitle="Select Preferred Profession"
                />
            </div>

            {/* Lifestyle */}
            <div className="space-y-1.5 shrink-0">
                <Label className="text-sm font-semibold">Lifestyle</Label>
                <MultiSelectGroup
                    options={config?.lifestylePreferences || []}
                    selectedValues={formData.lifestyle || []}
                    onChange={(values) => onChange("lifestyle", values)}
                    limit={5}
                    dialogTitle="Select Lifestyle Preferences"
                />
            </div>
        </div>
    );
}
