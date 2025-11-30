import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { convertFileToJpeg } from "@/lib/image-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { SortablePhotoGrid } from "@/components/listing/SortablePhotoGrid";

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
  const [uploadingImages, setUploadingImages] = useState(false);

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
        const listing = await apiClient.getRoomDetails(listingId);

        // Fetch actual media objects to get IDs
        try {
          const roomMedia = await apiClient.fetchMediaForResource(listingId, "IMAGE", "LISTING");
          const neighborhoodMedia = await apiClient.fetchMediaForResource(listingId, "IMAGE", "NEIGHBORHOOD");

          setPropertyImages(roomMedia ? roomMedia.map((item: any) => ({ id: item.id, url: item.url })) : []);
          setNeighborhoodImages(neighborhoodMedia ? neighborhoodMedia.map((item: any) => ({ id: item.id, url: item.url })) : []);

        } catch (mediaError) {
          console.warn("Failed to fetch detailed media, falling back to listing images", mediaError);
          if (listing) {
            const listingData = listing.data || listing;

            const newPropertyImages = (listingData.images || []).map((url: string, index: number) => ({
              id: index, // Fake ID, might cause issues with delete/reorder if not real
              url
            }));
            setPropertyImages(newPropertyImages);

            const newNeighborhoodImages = (listingData.neighborhoodImages || []).map((url: string, index: number) => ({
              id: index + 100,
              url
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'property' | 'neighborhood') => {
    const files = e.target.files;
    if (!files || files.length === 0 || !listingId) return;

    const currentImages = type === 'property' ? propertyImages : neighborhoodImages;
    const setImages = type === 'property' ? setPropertyImages : setNeighborhoodImages;
    const resourceType = type === 'property' ? "LISTING" : "NEIGHBORHOOD";

    // Check limit
    if (currentImages.length + files.length > 8) {
      toast({
        title: "Media limit exceeded",
        description: `You can upload a maximum of 8 ${type} photos`,
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }

    // Create local preview URLs
    const fileArray = Array.from(files);
    const previewItems = fileArray.map(file => ({ id: 0, url: URL.createObjectURL(file), isUploading: true }));
    const startIndex = currentImages.length;

    setImages(prev => [...prev, ...previewItems]);
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
        const { uploadId, presigned_url } = await apiClient.requestMediaUploadUrl(
          listingId,
          resourceType,
          file.type,
        );

        // Step 2: Upload to GCS
        const uploadResponse = await fetch(presigned_url, {
          method: 'PUT',
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        // Step 3: Confirm upload
        const confirmResponse = await apiClient.confirmMediaUpload(uploadId);

        return {
          index: startIndex + index,
          mediaId: confirmResponse.data.id,
          url: confirmResponse.data.url || confirmResponse.data.fullUrl || presigned_url
        };
      });

      const results = await Promise.all(uploadPromises);

      setImages(prev => {
        const newImages = [...prev];
        results.forEach(({ index, mediaId, url }) => {
          // Revoke blob URL
          if (newImages[index]) {
            URL.revokeObjectURL(newImages[index].url);
            newImages[index] = { id: mediaId, url: url, isUploading: false };
          }
        });
        return newImages;
      });

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
      setImages(prev => prev.slice(0, startIndex));
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleImagesChange = async (newImages: MediaItem[], type: 'property' | 'neighborhood') => {
    const oldImages = type === 'property' ? propertyImages : neighborhoodImages;
    const setImages = type === 'property' ? setPropertyImages : setNeighborhoodImages;
    const resourceType = type === 'property' ? "LISTING" : "NEIGHBORHOOD";

    // Check for deletions
    const removedItems = oldImages.filter(img => !newImages.find(n => n.id === img.id));

    // Optimistic update
    setImages(newImages);

    // Handle deletions
    for (const item of removedItems) {
      if (item.id !== 0) { // Don't try to delete previews/fakes
        try {
          await apiClient.deleteMedia(item.id);
        } catch (error) {
          console.error("Failed to delete media:", error);
          toast({
            title: "Error",
            description: "Failed to delete image",
            variant: "destructive",
          });
          // Revert? For now, just log.
        }
      }
    }

    // Handle reorder
    // Only reorder if no deletions happened (or after deletions) and order changed
    // But SortablePhotoGrid calls this for both reorder and delete (via filter).
    // If we just deleted, the order might be fine.
    // But we should sync the order of the remaining items.
    if (listingId && newImages.length > 0) {
      try {
        await apiClient.reorderMedia(
          listingId,
          "IMAGE",
          resourceType,
          newImages.map(img => ({ id: img.id }))
        );
      } catch (error) {
        console.error("Failed to reorder images:", error);
      }
    }
  };

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
              <SortablePhotoGrid
                images={propertyImages}
                onImagesChange={(images) => handleImagesChange(images, 'property')}
                onUpload={(e) => handleUpload(e, 'property')}
                uploadId="property-upload"
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
              <SortablePhotoGrid
                images={neighborhoodImages}
                onImagesChange={(images) => handleImagesChange(images, 'neighborhood')}
                onUpload={(e) => handleUpload(e, 'neighborhood')}
                uploadId="neighborhood-upload"
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
