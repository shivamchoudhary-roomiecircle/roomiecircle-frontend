import React from 'react';
import { ROOM_TYPES, PROPERTY_TYPES } from "@/constants/ui-constants";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SingleSelectOption, MultiSelectGroup } from "@/components/create-listing/shared/ListingFormComponents";
import { useFormContext, Controller } from "react-hook-form";
import { ListingFormData } from "@/schemas/listingSchema";

export function StepPropertyType() {
    const { control, register, formState: { errors } } = useFormContext<ListingFormData>();

    return (
        <div className="h-full flex flex-col gap-3">
            {/* Room Type */}
            <div className="space-y-1.5 shrink-0">
                <Label className="text-sm font-semibold">Room Type</Label>
                <Controller
                    control={control}
                    name="roomType"
                    render={({ field }) => (
                        <div className="flex flex-wrap gap-2">
                            {ROOM_TYPES.map((option) => (
                                <SingleSelectOption
                                    key={option.value}
                                    label={option.label}
                                    value={option.value}
                                    symbol={option.symbol}
                                    selected={field.value === option.value}
                                    onClick={() => {
                                        // Toggle logic: if clicking selected, set to null/empty
                                        if (field.value === option.value) {
                                            field.onChange(null);
                                        } else {
                                            field.onChange(option.value);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    )}
                />
                {errors.roomType && (
                    <p className="text-xs text-destructive font-medium">{errors.roomType.message}</p>
                )}
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
                        {...register("bhkType")}
                        className="h-10 text-sm px-3 pr-12 rounded-lg border"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                        BHK
                    </span>
                </div>
                {errors.bhkType && (
                    <p className="text-xs text-destructive font-medium">{errors.bhkType.message}</p>
                )}
                <p className="text-[10px] text-muted-foreground">
                    Use 0 for RK (Room Kitchen), 1 for 1BHK, 2 for 2BHK, etc.
                </p>
            </div>

            {/* Property Type */}
            <div className="space-y-1.5 shrink-0">
                <Label className="text-sm font-semibold">Property Type</Label>
                <Controller
                    control={control}
                    name="propertyType"
                    render={({ field }) => (
                        <MultiSelectGroup
                            options={[
                                { label: "None", value: "__NONE__" },
                                ...PROPERTY_TYPES
                            ]}
                            selectedValues={
                                (field.value || []).length === 0
                                    ? ["__NONE__"]
                                    : field.value || []
                            }
                            onChange={(values) => {
                                // If "None" is selected, clear the array
                                if (values.includes("__NONE__")) {
                                    const currentEmpty = (field.value || []).length === 0;
                                    if (!currentEmpty) {
                                        // None was just selected, clear everything
                                        field.onChange([]);
                                    } else {
                                        // None was already selected and something else was clicked, remove None
                                        const filtered = values.filter(v => v !== "__NONE__");
                                        field.onChange(filtered);
                                    }
                                } else {
                                    field.onChange(values);
                                }
                            }}
                            limit={5}
                        />
                    )}
                />
            </div>
        </div>
    );
}
