import React from 'react';
import { PROFESSIONS, LIFESTYLES } from "@/constants/ui-constants";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SingleSelectOption, MultiSelectGroup, SingleSelectGroup } from "@/components/create-listing/shared/ListingFormComponents";
import { useFormContext, Controller } from "react-hook-form";
import { ListingFormData } from "@/schemas/listingSchema";

export function StepPreferences() {
    const { register, control, formState: { errors } } = useFormContext<ListingFormData>();

    return (
        <div className="h-full flex flex-col gap-3">
            {/* Gender Preference */}
            <div className="space-y-1.5 shrink-0">
                <Label className="text-sm font-semibold">Gender Preference</Label>
                <Controller
                    control={control}
                    name="gender"
                    render={({ field }) => (
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: "Male", value: "MALE" },
                                { label: "Female", value: "FEMALE" },
                                { label: "Any", value: "ANY" },
                            ].map(opt => (
                                <SingleSelectOption
                                    key={opt.value}
                                    label={opt.label}
                                    value={opt.value}
                                    selected={field.value === opt.value}
                                    onClick={() => {
                                        if (field.value === opt.value) {
                                            field.onChange(null); // Toggle off
                                        } else {
                                            field.onChange(opt.value);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    )}
                />
            </div>

            {/* Age Range */}
            <div className="space-y-1.5 shrink-0">
                <Label className="text-sm font-semibold">Age Range</Label>
                <div className="flex items-center gap-2">
                    <div className="flex-1">
                        <Input
                            type="number"
                            placeholder="Min"
                            {...register("minAge")}
                            className="h-10 text-center text-sm rounded-lg border"
                        />
                    </div>
                    <span className="text-muted-foreground font-medium text-sm">to</span>
                    <div className="flex-1">
                        <Input
                            type="number"
                            placeholder="Max"
                            {...register("maxAge")}
                            className="h-10 text-center text-sm rounded-lg border"
                        />
                    </div>
                </div>
                {errors.minAge && (
                    <p className="text-xs text-destructive font-medium">{errors.minAge.message}</p>
                )}
            </div>

            {/* Profession */}
            <div className="space-y-1.5 shrink-0">
                <Label className="text-sm font-semibold">Preferred Profession</Label>
                <Controller
                    control={control}
                    name="profession"
                    render={({ field }) => (
                        <div className="flex flex-wrap gap-2">
                            {/* We are unwrapping SingleSelectGroup to implement custom toggle logic properly or wrapping it. 
                            If SingleSelectGroup doesn't support deselect, we might need to manually map options or 
                            create a new component. But since we have direct access to SingleSelectGroup,
                            let's check if we can pass a value that isn't in options to clear it? 
                            Yes, field.value can be null.
                            But SingleSelectGroup UI iterates options.
                            Let's use SingleSelectOption directly for maximum control if needed, OR just stick to SingleSelectGroup
                            but we need to intercept the click.
                            Wrapper div + SingleSelectOption loop is safest for custom toggle behavior.
                        */}
                            {PROFESSIONS.map(opt => (
                                <SingleSelectOption
                                    key={opt.value}
                                    label={opt.label}
                                    value={opt.value}
                                    symbol={opt.iconName}
                                    selected={field.value === opt.value}
                                    onClick={() => {
                                        if (field.value === opt.value) {
                                            field.onChange(null);
                                        } else {
                                            field.onChange(opt.value);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    )}
                />
            </div>

            {/* Lifestyle */}
            <div className="space-y-1.5 shrink-0">
                <Label className="text-sm font-semibold">Lifestyle</Label>
                <Controller
                    control={control}
                    name="lifestyle"
                    render={({ field }) => (
                        <MultiSelectGroup
                            options={LIFESTYLES}
                            selectedValues={field.value || []}
                            onChange={(values) => field.onChange(values)}
                            limit={5}
                            dialogTitle="Select Lifestyle Preferences"
                        />
                    )}
                />
            </div>
        </div>
    );
}
