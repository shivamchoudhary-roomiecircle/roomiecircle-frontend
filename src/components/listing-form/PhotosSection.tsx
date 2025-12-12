import { PhotoUploadGrid } from "@/components/listing/PhotoUploadGrid";
import { SectionProps } from "./types";

export const PhotosSection = ({ formData, onChange, listingId }: SectionProps & { listingId: string }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Room Photos</h2>
                <span className="text-sm text-muted-foreground">{(formData.images || []).length}/8</span>
            </div>

            <PhotoUploadGrid
                listingId={listingId}
                flow="listing"
                images={formData.images || []}
                onImagesChange={(newImages) => {
                    onChange("images", newImages);
                }}
            />
        </div>
    );
};
