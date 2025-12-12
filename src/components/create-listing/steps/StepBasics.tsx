import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import { ListingFormData } from "@/schemas/listingSchema";

export function StepBasics() {
    const { register, watch, formState: { errors } } = useFormContext<ListingFormData>();

    // Get today's date in YYYY-MM-DD format for min date
    const today = new Date().toISOString().split('T')[0];

    const description = watch("description");

    return (
        <div className="h-full flex flex-col gap-3">
            <div className="space-y-1 shrink-0">
                <Label htmlFor="floor" className="text-sm font-semibold">Which floor is it on?</Label>
                <div className="relative">
                    <Input
                        id="floor"
                        type="number"
                        placeholder="e.g. 1, 2, 0 (Ground)"
                        {...register("floor")}
                        className="h-10 text-sm px-3 pr-14 rounded-lg border"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                        Floor
                    </span>
                </div>
                {errors.floor && (
                    <p className="text-xs text-destructive font-medium">{errors.floor.message}</p>
                )}
                <p className="text-[10px] text-muted-foreground">Use 0 for Ground floor, negative for basement.</p>
            </div>

            <div className="space-y-1 shrink-0">
                <Label htmlFor="availableDate" className="text-sm font-semibold">Available from</Label>
                <Input
                    id="availableDate"
                    type="date"
                    min={today}
                    {...register("availableDate")}
                    className="h-10 text-sm px-3 rounded-lg border"
                />
                {errors.availableDate && (
                    <p className="text-xs text-destructive font-medium">{errors.availableDate.message}</p>
                )}
                <p className="text-[10px] text-muted-foreground">When can a roommate move in?</p>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                <Label htmlFor="description" className="text-sm font-semibold mb-1 shrink-0">Describe your place</Label>
                <Textarea
                    id="description"
                    placeholder="What makes your place special? Mention nearby landmarks, vibe, etc."
                    {...register("description")}
                    className="flex-1 min-h-0 text-sm p-2 rounded-lg border resize-none"
                />
                {errors.description && (
                    <p className="text-xs text-destructive font-medium mt-1">{errors.description.message}</p>
                )}
                <div className="flex justify-end mt-0.5 shrink-0">
                    <span className="text-[10px] text-muted-foreground">
                        {description?.length || 0} characters
                    </span>
                </div>
            </div>
        </div>
    );
}
