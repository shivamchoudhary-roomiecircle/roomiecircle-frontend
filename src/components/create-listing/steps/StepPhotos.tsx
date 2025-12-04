import React from 'react';
import { PhotoUploadGrid } from "@/components/listing/PhotoUploadGrid";
import { Label } from "@/components/ui/label";

interface MediaItem {
    id: number;
    url: string;
    isUploading?: boolean;
}

interface StepPhotosProps {
    listingId: string | null;
    images: MediaItem[];
    onChange: (images: MediaItem[]) => void;
}

export function StepPhotos({ listingId, images, onChange }: StepPhotosProps) {
    if (!listingId) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <p className="text-muted-foreground">
                    Please save your listing details before uploading photos.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label className="text-lg font-semibold">Add Photos</Label>
                <p className="text-muted-foreground text-sm">
                    Upload up to 8 photos. The first photo will be your cover image.
                </p>
            </div>

            <PhotoUploadGrid
                listingId={listingId}
                flow="listing"
                images={images}
                onImagesChange={onChange}
                maxImages={8}
            />
        </div>
    );
}
