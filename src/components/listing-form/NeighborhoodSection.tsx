import { useState } from "react";
import { EditableField } from "./EditableField";
import { SortablePhotoGrid } from "@/components/listing/SortablePhotoGrid";
import { mediaApi } from "@/lib/api";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SectionProps } from "./types";

export const NeighborhoodSection = ({ formData, onChange, listingId }: SectionProps & { listingId: string }) => {
    const { toast } = useToast();
    const [uploadingImages, setUploadingImages] = useState(false);

    const handleRatingChange = (field: "safety" | "connectivity" | "amenities", value: number) => {
        const newRatings = { ...formData.neighborhoodRatings, [field]: value };
        onChange("neighborhoodRatings", newRatings);
    };

    const handleNeighborhoodImagesChange = async (newImages: { id: number; url: string; isUploading?: boolean }[]) => {
        onChange("neighborhoodImages", newImages);
        // Call reorder API
        if (listingId) {
            try {
                await mediaApi.reorderMedia(
                    listingId,
                    "IMAGE",
                    "NEIGHBORHOOD",
                    newImages.map(img => ({ id: img.id }))
                );
            } catch (error) {
                console.error("Failed to reorder images:", error);
                toast({
                    title: "Error",
                    description: "Failed to save image order",
                    variant: "destructive",
                });
            }
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !listingId) return;

        // Check limit (8 per tag)
        if (formData.neighborhoodImages.length + files.length > 8) {
            toast({
                title: "Media limit exceeded",
                description: "You can upload a maximum of 8 neighborhood photos",
                variant: "destructive",
            });
            e.target.value = '';
            return;
        }

        // Create local preview URLs
        const fileArray = Array.from(files);
        const previewItems = fileArray.map(file => ({ id: 0, url: URL.createObjectURL(file), isUploading: true }));
        const startIndex = formData.neighborhoodImages.length;

        // Add preview URLs immediately
        onChange("neighborhoodImages", [...formData.neighborhoodImages, ...previewItems]);

        setUploadingImages(true);
        try {
            const uploadPromises = fileArray.map(async (file: File, index) => {
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    throw new Error(`Invalid file type: ${file.type}. Please upload JPEG, PNG, or WebP images.`);
                }

                // 1. Request URL
                const { uploadId, presigned_url } = await mediaApi.requestMediaUploadUrl(
                    listingId,
                    "NEIGHBORHOOD",
                    "IMAGE",
                    file.type,
                );

                // 2. Upload to Cloud
                const uploadResponse = await fetch(presigned_url, {
                    method: 'PUT',
                    headers: { 'Content-Type': file.type },
                    body: file,
                });

                if (!uploadResponse.ok) throw new Error(`Failed to upload ${file.name}`);

                // 3. Confirm
                const confirmResponse = await mediaApi.confirmMediaUpload(uploadId);

                return {
                    index: startIndex + index,
                    mediaId: confirmResponse.id,
                    url: confirmResponse.url || confirmResponse.fullUrl || presigned_url
                };
            });

            const results = await Promise.all(uploadPromises);

            // Replace previews with real URLs
            // We need to fetch the latest state or trust the index order
            // Since onChange is async-ish in parent, let's construct new list from previewItems + existing

            // NOTE: A better way is to pass a specialized updater, but for now we assume formData is reasonably fresh or we build based on what we just added.
            // Actually, we should just update the specific indices we added.

            // Re-read current formData from props (it might not be updated yet if parent re-render hasn't happened? React state updates are batched)
            // Ideally we should use a functional update if this was inside the parent, but here we call onChange.
            // Let's assume we can reconstruct the array.

            const newImagesList = [...formData.neighborhoodImages, ...previewItems]; // This includes previews we just added? 
            // Wait, we called onChange above. Render might have happened.
            // Let's rely on the fact that we appended `previewItems` at `startIndex`.

            const finalImages = [...newImagesList];
            // Fix the indices that were previews
            results.forEach(({ index, mediaId, url }) => {
                if (finalImages[index]) {
                    URL.revokeObjectURL(finalImages[index].url);
                    finalImages[index] = { id: mediaId, url: url, isUploading: false };
                }
            });

            onChange("neighborhoodImages", finalImages);

            toast({
                title: "Success",
                description: `${results.length} photo(s) uploaded successfully`,
            });
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: error?.message || "Failed to upload photos",
                variant: "destructive",
            });
            // Remove failed previews
            const validImages = formData.neighborhoodImages.slice(0, startIndex); // Revert to before specific upload
            onChange("neighborhoodImages", validImages);
            previewItems.forEach(item => URL.revokeObjectURL(item.url));
        } finally {
            setUploadingImages(false);
            e.target.value = '';
        }
    };

    return (
        <div>
            <h2 className="text-sm uppercase tracking-widest text-muted-foreground/80 font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent w-fit">Neighborhood Details</h2>
            <div className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-md shadow-lg p-6 hover:bg-white/10 transition-colors duration-300">
                <EditableField
                    label="Neighborhood Review"
                    value={formData.neighborhoodReview}
                    onSave={(val) => onChange("neighborhoodReview", val)}
                    multiline
                />

                <div className="py-4 space-y-4">
                    {(["safety", "connectivity", "amenities"] as const).map(metric => (
                        <div key={metric} className="flex items-center justify-between">
                            <Label className="capitalize">{metric} Rating</Label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleRatingChange(metric, star)}
                                        className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                                    >
                                        <Star
                                            className={`h-6 w-6 transition-colors ${star <= formData.neighborhoodRatings[metric]
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "fill-none text-muted-foreground"
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Neighborhood Photos</h2>
                    <span className="text-sm text-muted-foreground">{formData.neighborhoodImages.length}/8</span>
                </div>

                <SortablePhotoGrid
                    images={formData.neighborhoodImages}
                    onImagesChange={handleNeighborhoodImagesChange}
                    onUpload={handleUpload}
                    uploadId="neighborhood-photo-upload"
                />
            </div>
        </div>
    );
};
