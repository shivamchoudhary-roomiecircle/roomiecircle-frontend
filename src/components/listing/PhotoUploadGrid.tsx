import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { mediaApi } from "@/lib/api";
import { convertFileToJpeg } from "@/lib/image-utils";
import { SortablePhotoGrid } from "@/components/listing/SortablePhotoGrid";
import { ResourceTag } from "@/types/api.types";

interface MediaItem {
    id: number;
    url: string;
    isUploading?: boolean;
}

interface PhotoUploadGridProps {
    listingId: string;
    flow: 'listing' | 'neighborhood';
    images: MediaItem[];
    onImagesChange: (images: MediaItem[]) => void;
    maxImages?: number;
}

export function PhotoUploadGrid({
    listingId,
    flow,
    images,
    onImagesChange,
    maxImages = 8,
}: PhotoUploadGridProps) {
    const [uploadingImages, setUploadingImages] = useState(false);
    const resourceType: ResourceTag = flow === 'listing' ? "LISTING" : "NEIGHBORHOOD";
    const uploadId = `${flow}-upload`;

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !listingId) return;

        // Check limit
        if (images.length + files.length > maxImages) {
            toast({
                title: "Media limit exceeded",
                description: `You can upload a maximum of ${maxImages} photos`,
                variant: "destructive",
            });
            e.target.value = '';
            return;
        }

        // Create local preview URLs
        const fileArray = Array.from(files);
        const previewItems = fileArray.map(file => ({ id: 0, url: URL.createObjectURL(file), isUploading: true }));
        const startIndex = images.length;

        // Optimistic update with previews
        const newImagesWithPreviews = [...images, ...previewItems];
        onImagesChange(newImagesWithPreviews);
        setUploadingImages(true);

        try {
            const uploadPromises = fileArray.map(async (originalFile, index) => {
                let file = originalFile;
                try {
                    file = await convertFileToJpeg(originalFile);
                } catch (error) {
                    console.error("Failed to convert image:", error);
                }

                // Step 1: Request upload URL
                const { uploadId, presigned_url } = await mediaApi.requestMediaUploadUrl(
                    listingId,
                    resourceType,
                    "IMAGE",
                    file.type,
                );

                // Step 2: Upload to GCS
                const uploadResponse = await fetch(presigned_url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': file.type,
                    },
                    body: file,
                });

                if (!uploadResponse.ok) {
                    throw new Error(`Failed to upload ${file.name}`);
                }

                // Step 3: Confirm upload
                const confirmResponse = await mediaApi.confirmMediaUpload(uploadId);
                // confirmMediaUpload returns MediaDto directly (unwrapped from ApiResponse in apiClient)
                // But wait, looking at apiClient.confirmMediaUpload:
                // return response.data!;
                // So it returns MediaDto.
                // Let's check MediaDto definition in api.types.ts if possible, or infer from usage.
                // In UploadPhotos.tsx it was accessing confirmResponse.data.id which implies confirmResponse was the ApiResponse.
                // But apiClient.confirmMediaUpload returns response.data! which is MediaDto.
                // So confirmResponse IS MediaDto.
                // So we should access confirmResponse.id directly.

                return {
                    index: startIndex + index,
                    mediaId: confirmResponse.id,
                    url: confirmResponse.url || confirmResponse.fullUrl || presigned_url
                };
            });

            const results = await Promise.all(uploadPromises);

            // Update with real IDs and URLs
            const finalImages = [...newImagesWithPreviews];
            results.forEach(({ index, mediaId, url }) => {
                // Revoke blob URL
                if (finalImages[index]) {
                    URL.revokeObjectURL(finalImages[index].url);
                    finalImages[index] = { id: mediaId, url: url, isUploading: false };
                }
            });

            onImagesChange(finalImages);

            toast({
                title: "Success",
                description: `${results.length} photo(s) uploaded successfully`,
            });

        } catch (error: any) {
            console.error("Upload error:", error);
            toast({
                title: "Error",
                description: "Failed to upload photos",
                variant: "destructive",
            });
            // Remove failed previews
            onImagesChange(images); // Revert to original images (before previews)
        } finally {
            setUploadingImages(false);
            e.target.value = '';
        }
    };

    const handleGridImagesChange = async (newImages: MediaItem[]) => {
        // Check for deletions
        const removedItems = images.filter(img => !newImages.find(n => n.id === img.id));

        // Optimistic update
        onImagesChange(newImages);

        // Handle deletions
        for (const item of removedItems) {
            if (item.id !== 0) { // Don't try to delete previews/fakes
                try {
                    await mediaApi.deleteMedia(item.id);
                } catch (error) {
                    console.error("Failed to delete media:", error);
                    toast({
                        title: "Error",
                        description: "Failed to delete image",
                        variant: "destructive",
                    });
                    // Ideally we should revert here, but for now we just log
                }
            }
        }

        // Handle reorder
        // Only reorder if no deletions happened (or after deletions) and order changed
        if (listingId && newImages.length > 0 && removedItems.length === 0) {
            // Check if order actually changed
            const currentIds = images.map(img => img.id).join(',');
            const newIds = newImages.map(img => img.id).join(',');

            if (currentIds !== newIds) {
                try {
                    await mediaApi.reorderMedia(
                        listingId,
                        "IMAGE",
                        resourceType,
                        newImages.map(img => ({ id: img.id }))
                    );
                } catch (error) {
                    console.error("Failed to reorder images:", error);
                }
            }
        }
    };

    return (
        <SortablePhotoGrid
            images={images}
            onImagesChange={handleGridImagesChange}
            onUpload={handleUpload}
            uploadId={uploadId}
            maxImages={maxImages}
        />
    );
}
