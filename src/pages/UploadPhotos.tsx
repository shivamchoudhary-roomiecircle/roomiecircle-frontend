import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Image as ImageIcon, X, Upload } from "lucide-react";

export default function UploadPhotos() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get("id");
  
  const [uploadingImages, setUploadingImages] = useState(false);
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [neighborhoodImages, setNeighborhoodImages] = useState<string[]>([]);

  const handlePropertyImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (propertyImages.length + files.length > 8) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 8 property photos",
        variant: "destructive",
      });
      return;
    }

    // Simulate image upload - replace with actual upload logic
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    setPropertyImages(prev => [...prev, ...newImages]);
  };

  const handleNeighborhoodImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (neighborhoodImages.length + files.length > 8) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 8 neighborhood photos",
        variant: "destructive",
      });
      return;
    }

    // Simulate image upload - replace with actual upload logic
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    setNeighborhoodImages(prev => [...prev, ...newImages]);
  };

  const removePropertyImage = (index: number) => {
    setPropertyImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNeighborhoodImage = (index: number) => {
    setNeighborhoodImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
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
      
      // Add your API call here to upload images
      // await apiClient.uploadListingImages(listingId, { propertyImages, neighborhoodImages });
      
      toast({
        title: "Success",
        description: "Photos uploaded successfully!",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error uploading images:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload photos",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
    }
  };

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
                    accept="image/*"
                    className="hidden"
                    onChange={handlePropertyImageUpload}
                    disabled={propertyImages.length >= 8}
                  />
                </Label>
              </div>

              {propertyImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {propertyImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePropertyImage(index)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    accept="image/*"
                    className="hidden"
                    onChange={handleNeighborhoodImageUpload}
                    disabled={neighborhoodImages.length >= 8}
                  />
                </Label>
              </div>

              {neighborhoodImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {neighborhoodImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Neighborhood ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeNeighborhoodImage(index)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
              onClick={() => navigate("/dashboard")}
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploadingImages || propertyImages.length < 3}
            >
              {uploadingImages && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload Photos
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
