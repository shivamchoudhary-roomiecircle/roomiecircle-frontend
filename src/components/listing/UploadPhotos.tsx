import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { listingsApi, mediaApi } from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { PhotoUploadGrid } from "@/components/listing/PhotoUploadGrid";

interface MediaItem {
  id: number;
  url: string;
  isUploading?: boolean;
}

interface UploadPhotosContentProps {
  listingId: string;
  onFinish: () => void;
}

export default function UploadPhotosContent({ listingId, onFinish }: UploadPhotosContentProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [propertyImages, setPropertyImages] = useState<MediaItem[]>([]);
  const [neighborhoodImages, setNeighborhoodImages] = useState<MediaItem[]>([]);

  // Load existing photos
  useEffect(() => {
    const loadExistingPhotos = async () => {
      if (!listingId) {
        toast({
          title: "Error",
          description: "No listing ID provided",
          variant: "destructive",
        });
        navigate("/my-listings");
        return;
      }

      try {
        setLoading(true);
        const listing = await listingsApi.getRoomListingById(listingId);

        // Fetch actual media objects to get IDs
        try {
          const roomMedia = await mediaApi.fetchMediaForResource(listingId, "IMAGE", "LISTING");
          const neighborhoodMedia = await mediaApi.fetchMediaForResource(listingId, "IMAGE", "NEIGHBORHOOD");

          setPropertyImages(roomMedia ? roomMedia.map((item: any) => ({ id: item.id, url: getImageUrl(item.url) })) : []);
          setNeighborhoodImages(neighborhoodMedia ? neighborhoodMedia.map((item: any) => ({ id: item.id, url: getImageUrl(item.url) })) : []);

        } catch (mediaError) {
          console.warn("Failed to fetch detailed media, falling back to listing images", mediaError);
          if (listing) {
            const listingData = listing;

            const newPropertyImages = (listingData.images || []).map((img: any, index: number) => ({
              id: img.id || index,
              url: getImageUrl(img.url || img)
            }));
            setPropertyImages(newPropertyImages);

            const newNeighborhoodImages = (listingData.neighborhoodImages || []).map((img: any, index: number) => ({
              id: img.id || index + 100,
              url: getImageUrl(img.url || img)
            }));
            setNeighborhoodImages(newNeighborhoodImages);
          }
        }

      } catch (error: any) {
        console.error("Error loading listing:", error);
        toast({
          title: "Error",
          description: "Failed to load listing photos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadExistingPhotos();
  }, [listingId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!listingId) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Photos</h1>
          <p className="text-muted-foreground">Add photos to showcase your property. Drag to reorder.</p>
        </div>

        <div className="space-y-8">
          {/* Property Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Property Photos
              </CardTitle>
              <CardDescription>
                Upload up to 8 photos of your property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUploadGrid
                listingId={listingId}
                flow="listing"
                images={propertyImages}
                onImagesChange={setPropertyImages}
              />
            </CardContent>
          </Card>

          {/* Neighborhood Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Neighborhood Photos
              </CardTitle>
              <CardDescription>
                Upload up to 8 photos of the surrounding neighborhood
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUploadGrid
                listingId={listingId}
                flow="neighborhood"
                images={neighborhoodImages}
                onImagesChange={setNeighborhoodImages}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onFinish}
            >
              Cancel
            </Button>
            <Button onClick={onFinish}>
              Save & Finish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
