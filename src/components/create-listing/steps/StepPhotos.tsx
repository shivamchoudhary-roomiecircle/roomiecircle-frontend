import React from 'react';
import { PhotoUploadGrid } from "@/components/listing/PhotoUploadGrid";
import { useFormContext, Controller } from "react-hook-form";
import { ListingFormData } from "@/schemas/listingSchema";

interface StepPhotosProps {
    listingId: string | null;
}

export function StepPhotos({ listingId }: StepPhotosProps) {
    const { control, formState: { errors } } = useFormContext<ListingFormData>();

    if (!listingId) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-muted-foreground text-sm">
                    Please save your listing details before uploading photos.
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <Controller
                control={control}
                name="images"
                render={({ field: { value, onChange } }) => (
                    <PhotoUploadGrid
                        listingId={listingId}
                        flow="listing"
                        images={value || []}
                        onImagesChange={onChange}
                        maxImages={8}
                    />
                )}
            />
            {errors.images && (
                <p className="text-xs text-destructive font-medium mt-2 text-center">{errors.images.message}</p>
            )}
        </div>
    );
}
