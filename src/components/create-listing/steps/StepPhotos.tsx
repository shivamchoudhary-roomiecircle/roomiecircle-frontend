import React from 'react';
import { PhotoUploadGrid } from "@/components/listing/PhotoUploadGrid";

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
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-muted-foreground text-sm">
                    Please save your listing details before uploading photos.
                </p>
            </div>
        );
    }

    return (
        <div className="h-full">
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
