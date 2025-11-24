import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Image as ImageIcon, X, Upload } from "lucide-react";

export default function UploadPhotos() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const listingId = searchParams.get("id");
  const navigationState = location.state as { skipListingFetch?: boolean } | null;
  const shouldSkipListingFetch = Boolean(navigationState?.skipListingFetch);

  const [uploadingImages, setUploadingImages] = useState(false);
  const [loading, setLoading] = useState(false);
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [neighborhoodImages, setNeighborhoodImages] = useState<string[]>([]);
  const [uploadingPropertyIndexes, setUploadingPropertyIndexes] = useState<Set<number>>(new Set());
  const [uploadingNeighborhoodIndexes, setUploadingNeighborhoodIndexes] = useState<Set<number>>(new Set());

  // Load existing photos if editing
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

      if (shouldSkipListingFetch) {
        return;
      }

      try {
        setLoading(true);
        const listing = await apiClient.getRoomListing(listingId);
        if (listing) {
          const listingData = listing.data || listing;
          setPropertyImages(listingData.images || []);
          setNeighborhoodImages(listingData.neighborhoodImages || []);
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
  }, [listingId, navigate, shouldSkipListingFetch]);

  // Helper function to extract file key from presigned URL
  const extractFileKey = (presignedUrl: string): string => {
    try {
      const url = new URL(presignedUrl);
      const pathname = url.pathname.substring(1);
      const parts = pathname.split('/');
      return parts.slice(1).join('/');
    } catch (error) {
      console.error("Error extracting file key:", error);
      throw new Error("Failed to extract file key from URL");
    }
  };

  const handlePropertyImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !listingId) return;

    if (propertyImages.length + files.length > 8) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 8 property photos",
        variant: "destructive",
      });
      return;
    }

    // Create local preview URLs immediately
    const fileArray = Array.from(files);
    const previewUrls = fileArray.map(file => URL.createObjectURL(file));
    const startIndex = propertyImages.length;

    // Add preview URLs immediately for instant feedback
    setPropertyImages(prev => [...prev, ...previewUrls]);
    setUploadingPropertyIndexes(new Set(Array.from({ length: previewUrls.length }, (_, i) => startIndex + i)));

    setUploadingImages(true);
    try {
      const uploadPromises = fileArray.map(async (file, index) => {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          throw new Error(`Invalid file type: ${file.type}. Please upload JPEG, PNG, or WebP images.`);
        }

        // Step 1: Request upload URL
        const { id, presigned_url } = await apiClient.requestMediaUploadUrl(
          listingId,
          "room",
          file.type,
          file.name
        );

        // Step 2: Upload to GCS
        const uploadResponse = await fetch(presigned_url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        // Step 3: Confirm upload
        const fileKey = extractFileKey(presigned_url);
        await apiClient.confirmMediaUpload(listingId, fileKey);

        return { index: startIndex + index, mediaId: id, presigned_url };
      });

      const results = await Promise.all(uploadPromises);
      console.log("Uploaded property photo URLs:", results);

      // Replace preview URLs with actual photo URLs
      setPropertyImages(prev => {
        const newImages = [...prev];
        results.forEach(({ index, presigned_url }) => {
          // Revoke the blob URL to free memory
          URL.revokeObjectURL(newImages[index]);
          const url = new URL(presigned_url);
          newImages[index] = `${url.origin}${url.pathname}`;
        });
        console.log("Updated property images array:", newImages);
        return newImages;
      });

      setUploadingPropertyIndexes(new Set());
      toast({
        title: "Success",
        description: `${results.length} photo(s) uploaded successfully`,
      });
    } catch (error: any) {
      // Remove failed previews
      setPropertyImages(prev => {
        const newImages = prev.slice(0, startIndex);
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        return newImages;
      });
      setUploadingPropertyIndexes(new Set());
      toast({
        title: "Error",
        description: error?.message || "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleNeighborhoodImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !listingId) return;

    if (neighborhoodImages.length + files.length > 8) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 8 neighborhood photos",
        variant: "destructive",
      });
      return;
    }

    // Create local preview URLs immediately
    const fileArray = Array.from(files);
    const previewUrls = fileArray.map(file => URL.createObjectURL(file));
    const startIndex = neighborhoodImages.length;

    // Add preview URLs immediately for instant feedback
    setNeighborhoodImages(prev => [...prev, ...previewUrls]);
    setUploadingNeighborhoodIndexes(new Set(Array.from({ length: previewUrls.length }, (_, i) => startIndex + i)));

    setUploadingImages(true);
    try {
      const uploadPromises = fileArray.map(async (file, index) => {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          throw new Error(`Invalid file type: ${file.type}. Please upload JPEG, PNG, or WebP images.`);
        }

        // Step 1: Request upload URL
        const { id, presigned_url } = await apiClient.requestMediaUploadUrl(
          listingId,
          "neighbourhood",
          file.type,
          file.name
        );

        // Step 2: Upload to GCS
        const uploadResponse = await fetch(presigned_url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        // Step 3: Confirm upload
        const fileKey = extractFileKey(presigned_url);
        await apiClient.confirmMediaUpload(listingId, fileKey);

        return { index: startIndex + index, mediaId: id, presigned_url };
      });

      const results = await Promise.all(uploadPromises);
      console.log("Uploaded neighborhood photo URLs:", results);

      // Replace preview URLs with actual photo URLs
      setNeighborhoodImages(prev => {
        const newImages = [...prev];
        results.forEach(({ index, presigned_url }) => {
          // Revoke the blob URL to free memory
          URL.revokeObjectURL(newImages[index]);
          const url = new URL(presigned_url);
          newImages[index] = `${url.origin}${url.pathname}`;
        });
        console.log("Updated neighborhood images array:", newImages);
        return newImages;
      });

      setUploadingNeighborhoodIndexes(new Set());
      toast({
        title: "Success",
        description: `${results.length} photo(s) uploaded successfully`,
      });
    } catch (error: any) {
      // Remove failed previews
      setNeighborhoodImages(prev => {
        const newImages = prev.slice(0, startIndex);
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        return newImages;
      });
      setUploadingNeighborhoodIndexes(new Set());
      toast({
        title: "Error",
        description: error?.message || "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const removePropertyImage = (index: number) => {
    setPropertyImages(prev => {
      const imageUrl = prev[index];
      // Revoke blob URL if it's a blob URL
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeNeighborhoodImage = (index: number) => {
    setNeighborhoodImages(prev => {
      const imageUrl = prev[index];
      // Revoke blob URL if it's a blob URL
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (!listingId) {
      toast({
        title: "Error",
        description: "No listing ID provided",
        variant: "destructive",
      });
      return;
    }

    if (propertyImages.length < 3) {
      toast({
        title: "Not enough photos",
        description: "Please upload at least 3 property photos",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingImages(true);

      // Update listing with photo URLs
      await apiClient.updateRoomListing(listingId, {
        images: propertyImages,
        neighborhoodImages: neighborhoodImages,
      });

      toast({
        title: "Success",
        description: "Photos saved successfully!",
      });

      navigate("/my-listings");
    } catch (error: any) {
      console.error("Error saving photos:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save photos",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!listingId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload Photos</h1>
          <p className="text-muted-foreground">Add photos to showcase your property</p>
        </div>

        <div className="space-y-6">
          {/* Property Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Property Photos
              </CardTitle>
              <CardDescription>
                Upload 3-8 photos of your property (minimum 3 required)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="property-images" className="cursor-pointer">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload property photos
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {propertyImages.length}/8 photos uploaded
                    </p>
                  </div>
                  <input
                    id="property-images"
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    capture="environment"
                    className="hidden"
                    onChange={handlePropertyImageUpload}
                    disabled={uploadingImages || propertyImages.length >= 8}
                  />
                </Label>
              </div>

              {propertyImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {propertyImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="w-full h-32 rounded-lg overflow-hidden bg-muted relative">
                        {uploadingPropertyIndexes.has(index) && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          </div>
                        )}
                        <img
                          src={image}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error("Failed to load image:", image);
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EImage%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <button
                        onClick={() => removePropertyImage(index)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        aria-label="Remove photo"
                        disabled={uploadingPropertyIndexes.has(index)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Neighborhood Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Neighborhood Photos (Optional)
              </CardTitle>
              <CardDescription>
                Upload up to 8 photos of the surrounding neighborhood
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="neighborhood-images" className="cursor-pointer">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload neighborhood photos
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {neighborhoodImages.length}/8 photos uploaded
                    </p>
                  </div>
                  <input
                    id="neighborhood-images"
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    capture="environment"
                    className="hidden"
                    onChange={handleNeighborhoodImageUpload}
                    disabled={uploadingImages || neighborhoodImages.length >= 8}
                  />
                </Label>
              </div>

              {neighborhoodImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {neighborhoodImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="w-full h-32 rounded-lg overflow-hidden bg-muted relative">
                        {uploadingNeighborhoodIndexes.has(index) && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          </div>
                        )}
                        <img
                          src={image}
                          alt={`Neighborhood ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error("Failed to load image:", image);
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EImage%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <button
                        onClick={() => removeNeighborhoodImage(index)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        aria-label="Remove photo"
                        disabled={uploadingNeighborhoodIndexes.has(index)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/my-listings")}
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploadingImages || loading || propertyImages.length < 3}
            >
              {uploadingImages ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Photos"
              )}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
