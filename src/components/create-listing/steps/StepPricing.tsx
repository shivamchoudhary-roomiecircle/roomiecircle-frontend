import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormContext, Controller } from "react-hook-form";
import { ListingFormData } from "@/schemas/listingSchema";

export function StepPricing() {
    const { register, control, formState: { errors } } = useFormContext<ListingFormData>();

    return (
        <div className="h-full flex flex-col gap-3">
            <div className="space-y-1 shrink-0">
                <Label htmlFor="monthlyRent" className="text-sm font-semibold">Monthly Rent</Label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        ₹
                    </div>
                    <Input
                        id="monthlyRent"
                        type="number"
                        placeholder="0"
                        {...register("monthlyRent")}
                        className="pl-7 h-10 text-sm rounded-lg border"
                    />
                </div>
                {errors.monthlyRent && (
                    <p className="text-xs text-destructive font-medium">{errors.monthlyRent.message}</p>
                )}
            </div>

            <div className="space-y-1 shrink-0">
                <Label htmlFor="deposit" className="text-sm font-semibold">Security Deposit</Label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        ₹
                    </div>
                    <Input
                        id="deposit"
                        type="number"
                        placeholder="0"
                        {...register("deposit")}
                        className="pl-7 h-10 text-sm rounded-lg border"
                    />
                </div>
                {errors.deposit && (
                    <p className="text-xs text-destructive font-medium">{errors.deposit.message}</p>
                )}
            </div>

            <div className="space-y-1 shrink-0">
                <Label htmlFor="maintenance" className="text-sm font-semibold">Maintenance</Label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        ₹
                    </div>
                    <Input
                        id="maintenance"
                        type="number"
                        placeholder="0"
                        {...register("maintenance")}
                        className="pl-7 h-10 text-sm rounded-lg border"
                    />
                </div>
                {errors.maintenance && (
                    <p className="text-xs text-destructive font-medium">{errors.maintenance.message}</p>
                )}

                <div className="flex items-center space-x-2 pt-1">
                    <Controller
                        control={control}
                        name="maintenanceIncluded"
                        render={({ field: { value, onChange } }) => (
                            <Checkbox
                                id="maintenanceIncluded"
                                checked={value}
                                onCheckedChange={onChange}
                                className="h-4 w-4 border"
                            />
                        )}
                    />
                    <Label htmlFor="maintenanceIncluded" className="text-xs font-medium cursor-pointer">
                        Maintenance included in rent
                    </Label>
                </div>
            </div>
        </div>
    );
}
