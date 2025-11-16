import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { useConfig } from "@/contexts/ConfigContext";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Home, DollarSign, MapPin, Bed, Users, Image as ImageIcon, Star, X } from "lucide-react";
import { LocationAutocomplete } from "@/components/search/LocationAutocomplete";
import { IconRenderer } from "@/lib/iconMapper";

interface RoommateData {
  name: string;
  gender: string;
  age: number;
  profession: string;
  bio: string;
}

export default function CreateRoomListing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get("id");
  const { config, loading: configLoading } = useConfig();
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const [formData, setFormData] = useState({
    description: "",
    monthlyRent: "",
    maintenance: "",
    maintenanceIncluded: false,
    deposit: "",
    availableDate: "",
    addressText: "",
    placeId: "",
    latitude: 0,
    longitude: 0,
    roomType: "",
    propertyType: [] as string[],
    bhkType: "",
    floor: "",
    hasBalcony: false,
    hasPrivateWashroom: false,
    hasFurniture: false,
    amenities: [] as string[],
    images: [] as string[],
    minAge: "",
    maxAge: "",
    gender: "",
    profession: "",
    lifestyle: [] as string[],
    roommates: [] as RoommateData[],
    neighborhoodReview: "",
    neighborhoodRatings: {
      safety: 0,
      connectivity: 0,
      amenities: 0,
    },
    neighborhoodImages: [] as string[],
  });

  // Fetch listing data when editing
  useEffect(() => {
    const fetchListingData = async () => {
      if (!listingId) return;
      
      try {
        setLoading(true);
        const response = await apiClient.getRoomListing(listingId);
        // Handle response structure - could be response.data or response directly
        const listing = response.data || response;
        
        // Transform and prefill form data
        setFormData({
          description: listing.description || "",
          monthlyRent: listing.monthlyRent ? listing.monthlyRent.toString() : "",
          maintenance: listing.maintenance ? listing.maintenance.toString() : "",
          maintenanceIncluded: listing.maintenanceIncluded || false,
          deposit: listing.deposit ? listing.deposit.toString() : "",
          availableDate: listing.availableDate || "",
          addressText: listing.addressText || listing.address || "",
          placeId: listing.placeId || "",
          latitude: listing.latitude || 0,
          longitude: listing.longitude || 0,
          roomType: listing.roomType || "",
          propertyType: Array.isArray(listing.propertyType) 
            ? listing.propertyType 
            : listing.propertyType 
              ? [listing.propertyType] 
              : [],
          bhkType: listing.bhkType || "",
          floor: listing.floor ? listing.floor.toString() : "",
          hasBalcony: listing.hasBalcony || false,
          hasPrivateWashroom: listing.hasPrivateWashroom || false,
          hasFurniture: listing.hasFurniture || false,
          amenities: (() => {
            // Handle different amenities formats
            if (Array.isArray(listing.amenities)) {
              return listing.amenities;
            }
            if (listing.amenities && typeof listing.amenities === 'object') {
              // Extract amenity keys from nested structure like { in_home: [{ key: "air_conditioning" }], on_property: [...] }
              const amenityKeys: string[] = [];
              Object.values(listing.amenities).forEach((category: any) => {
                if (Array.isArray(category)) {
                  category.forEach((item: any) => {
                    // Handle both { key: "air_conditioning" } and direct string formats
                    if (typeof item === 'string') {
                      amenityKeys.push(item);
                    } else if (item && item.key) {
                      amenityKeys.push(item.key);
                    } else if (item && typeof item === 'object') {
                      // If it's an object without 'key', try to use the value directly
                      amenityKeys.push(item);
                    }
                  });
                }
              });
              return amenityKeys;
            }
            return [];
          })(),
          images: listing.images || [],
          minAge: listing.roommatePreferences?.minAge ? listing.roommatePreferences.minAge.toString() : "",
          maxAge: listing.roommatePreferences?.maxAge ? listing.roommatePreferences.maxAge.toString() : "",
          gender: listing.roommatePreferences?.gender || "",
          profession: listing.roommatePreferences?.profession || "",
          lifestyle: listing.roommatePreferences?.lifestyle || listing.lifestyle || [],
          roommates: listing.existingRoommates || [],
          neighborhoodReview: listing.neighborhoodReview || "",
          neighborhoodRatings: listing.neighborhoodRatings || {
            safety: 0,
            connectivity: 0,
            amenities: 0,
          },
          neighborhoodImages: listing.neighborhoodImages || [],
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to load listing data. Please try again.",
          variant: "destructive",
        });
        navigate("/my-listings");
      } finally {
        setLoading(false);
      }
    };

    fetchListingData();
  }, [listingId, navigate]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !listingId) return;

    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          throw new Error(`Invalid file type: ${file.type}. Please upload JPEG, PNG, or WebP images.`);
        }

        // Get upload URL from API
        const { uploadUrl, photoUrl } = await apiClient.getPhotoUploadUrl(
          listingId,
          file.type,
          file.name
        );

        // Upload file to the provided URL
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        return photoUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Add uploaded photo URLs to form data
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

      toast({
        title: "Success",
        description: `${uploadedUrls.length} photo(s) uploaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedFieldChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...(prev[parent as keyof typeof prev] as any), [field]: value }
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handlePropertyTypeToggle = (propertyType: string) => {
    setFormData(prev => ({
      ...prev,
      propertyType: prev.propertyType.includes(propertyType)
        ? prev.propertyType.filter(p => p !== propertyType)
        : [...prev.propertyType, propertyType]
    }));
  };

  const handleLifestyleToggle = (lifestyle: string) => {
    setFormData(prev => ({
      ...prev,
      lifestyle: prev.lifestyle.includes(lifestyle)
        ? prev.lifestyle.filter(l => l !== lifestyle)
        : [...prev.lifestyle, lifestyle]
    }));
  };

  const handleAddRoommate = () => {
    setFormData(prev => ({
      ...prev,
      roommates: [...prev.roommates, { name: "", gender: "", age: 0, profession: "", bio: "" }]
    }));
  };

  const handleRoommateChange = (index: number, field: keyof RoommateData, value: any) => {
    setFormData(prev => ({
      ...prev,
      roommates: prev.roommates.map((r, i) => i === index ? { ...r, [field]: value } : r)
    }));
  };

  const handleRemoveRoommate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      roommates: prev.roommates.filter((_, i) => i !== index)
    }));
  };

  const handleLocationChange = (value: string, placeId?: string) => {
    setFormData(prev => ({
      ...prev,
      addressText: value,
      placeId: placeId || "",
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {};
      
      // Only include non-empty fields
      if (formData.description) payload.description = formData.description;
      if (formData.monthlyRent) payload.monthlyRent = parseInt(formData.monthlyRent);
      if (formData.maintenance) payload.maintenance = parseInt(formData.maintenance);
      payload.maintenanceIncluded = formData.maintenanceIncluded;
      if (formData.deposit) payload.deposit = parseInt(formData.deposit);
      if (formData.availableDate) payload.availableDate = formData.availableDate;
      if (formData.addressText) payload.addressText = formData.addressText;
      if (formData.placeId) payload.placeId = formData.placeId;
      if (formData.latitude) payload.latitude = formData.latitude;
      if (formData.longitude) payload.longitude = formData.longitude;
      if (formData.roomType) payload.roomType = formData.roomType;
      if (formData.propertyType.length > 0) payload.propertyType = formData.propertyType;
      if (formData.bhkType) payload.bhkType = formData.bhkType;
      if (formData.floor) payload.floor = formData.floor;
      payload.hasBalcony = formData.hasBalcony;
      payload.hasPrivateWashroom = formData.hasPrivateWashroom;
      payload.hasFurniture = formData.hasFurniture;
      if (formData.amenities.length > 0) payload.amenities = formData.amenities;
      if (formData.images.length > 0) payload.images = formData.images;
      if (formData.minAge) payload.minAge = parseInt(formData.minAge);
      if (formData.maxAge) payload.maxAge = parseInt(formData.maxAge);
      if (formData.gender) payload.gender = formData.gender;
      if (formData.profession) payload.profession = formData.profession;
      if (formData.lifestyle.length > 0) payload.lifestyle = formData.lifestyle;
      if (formData.roommates.length > 0) payload.roommates = formData.roommates;
      if (formData.neighborhoodReview) payload.neighborhoodReview = formData.neighborhoodReview;
      if (Object.values(formData.neighborhoodRatings).some(v => v > 0)) {
        payload.neighborhoodRatings = formData.neighborhoodRatings;
      }
      if (formData.neighborhoodImages.length > 0) payload.neighborhoodImages = formData.neighborhoodImages;

      let savedListingId = listingId;
      
      if (listingId) {
        // Update existing listing using PATCH
        const response = await apiClient.updateRoomListing(listingId, payload);
        savedListingId = listingId;
        toast({
          title: "Success",
          description: "Your listing has been updated!",
        });
      } else {
        // Create new listing using POST
        const response = await apiClient.createRoomListing(payload);
        // Extract listing ID from response if available
        savedListingId = response?.id || response?.data?.id || null;
        toast({
          title: "Success",
          description: "Your listing has been saved!",
        });
      }
      
      // If we have photos to upload and we just created a listing, upload them now
      if (formData.images.length > 0 && savedListingId && !listingId) {
        // Photos are already in formData.images, they'll be saved with the listing
        // But if user uploaded new photos that need to be uploaded to storage, handle that
      }
      
      navigate("/my-listings");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to save listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{listingId ? "Edit Listing" : "List Your Room"}</h1>
          </div>
          <Button onClick={handleSave} size="lg" disabled={saving || loading}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {listingId ? "Updating..." : "Saving..."}
              </>
            ) : (
              listingId ? "Update Listing" : "Save Listing"
            )}
          </Button>
        </div>

        {/* Basic Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Basic Details
            </CardTitle>
            <CardDescription>Tell us about your room</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your room..."
                value={formData.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roomType">Room Type</Label>
                <Select value={formData.roomType} onValueChange={(v) => handleFieldChange("roomType", v)} disabled={!config?.roomTypes || config.roomTypes.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={config?.roomTypes && config.roomTypes.length > 0 ? "Select room type" : "Loading..."} />
                  </SelectTrigger>
                  {config?.roomTypes && config.roomTypes.length > 0 && (
                    <SelectContent>
                      {config.roomTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <IconRenderer symbol={type.symbol} />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  )}
                </Select>
              </div>

              <div>
                <Label htmlFor="bhkType">BHK Type</Label>
                <Select value={formData.bhkType} onValueChange={(v) => handleFieldChange("bhkType", v)} disabled={!config?.bhkTypes || config.bhkTypes.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={config?.bhkTypes && config.bhkTypes.length > 0 ? "Select BHK type" : "Loading..."} />
                  </SelectTrigger>
                  {config?.bhkTypes && config.bhkTypes.length > 0 && (
                    <SelectContent>
                      {config.bhkTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <IconRenderer symbol={type.symbol} />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  )}
                </Select>
              </div>

              <div>
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  type="number"
                  placeholder="e.g., 2, 3, 0 (Ground)"
                  value={formData.floor}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow integers (including negative for basement floors)
                    if (value === '' || /^-?\d+$/.test(value)) {
                      handleFieldChange("floor", value);
                    }
                  }}
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="availableDate">Available From</Label>
                <Input
                  id="availableDate"
                  type="date"
                  value={formData.availableDate}
                  onChange={(e) => handleFieldChange("availableDate", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Property Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {config?.propertyTypes && config.propertyTypes.length > 0 ? (
                  config.propertyTypes.map(type => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`property-${type.value}`}
                        checked={formData.propertyType.includes(type.value)}
                        onCheckedChange={() => handlePropertyTypeToggle(type.value)}
                      />
                      <Label htmlFor={`property-${type.value}`} className="flex items-center gap-2 cursor-pointer">
                        <IconRenderer symbol={type.symbol} />
                        <span>{type.label}</span>
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Loading property types...</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasBalcony"
                  checked={formData.hasBalcony}
                  onCheckedChange={(checked) => handleFieldChange("hasBalcony", checked)}
                />
                <Label htmlFor="hasBalcony">Has Balcony</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasPrivateWashroom"
                  checked={formData.hasPrivateWashroom}
                  onCheckedChange={(checked) => handleFieldChange("hasPrivateWashroom", checked)}
                />
                <Label htmlFor="hasPrivateWashroom">Has Private Washroom</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasFurniture"
                  checked={formData.hasFurniture}
                  onCheckedChange={(checked) => handleFieldChange("hasFurniture", checked)}
                />
                <Label htmlFor="hasFurniture">Furnished</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing
            </CardTitle>
            <CardDescription>Set your rent and deposit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthlyRent">Monthly Rent (₹)</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  placeholder="15000"
                  value={formData.monthlyRent}
                  onChange={(e) => handleFieldChange("monthlyRent", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="deposit">Security Deposit (₹)</Label>
                <Input
                  id="deposit"
                  type="number"
                  placeholder="45000"
                  value={formData.deposit}
                  onChange={(e) => handleFieldChange("deposit", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="maintenance">Maintenance (₹)</Label>
                <Input
                  id="maintenance"
                  type="number"
                  placeholder="2000"
                  value={formData.maintenance}
                  onChange={(e) => handleFieldChange("maintenance", e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="maintenanceIncluded"
                    checked={formData.maintenanceIncluded}
                    onCheckedChange={(checked) => handleFieldChange("maintenanceIncluded", checked)}
                  />
                  <Label htmlFor="maintenanceIncluded">Maintenance Included in Rent</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
            <CardDescription>Where is your property located?</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="location">Address</Label>
            <LocationAutocomplete
              value={formData.addressText}
              onChange={handleLocationChange}
              placeholder="Search for your address..."
            />
            {formData.addressText && (
              <p className="text-sm text-muted-foreground mt-2">{formData.addressText}</p>
            )}
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Amenities
            </CardTitle>
            <CardDescription>What amenities does your property offer?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {config?.amenities && (
              <>
                <div>
                  <h3 className="font-semibold mb-3">In Home</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {config.amenities.in_home.map(amenity => (
                      <div key={amenity.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity.value}
                          checked={formData.amenities.includes(amenity.value)}
                          onCheckedChange={() => handleAmenityToggle(amenity.value)}
                        />
                        <Label htmlFor={amenity.value} className="flex items-center gap-2 cursor-pointer">
                          <IconRenderer symbol={amenity.symbol} />
                          <span>{amenity.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">On Property</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {config.amenities.on_property.map(amenity => (
                      <div key={amenity.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity.value}
                          checked={formData.amenities.includes(amenity.value)}
                          onCheckedChange={() => handleAmenityToggle(amenity.value)}
                        />
                        <Label htmlFor={amenity.value} className="flex items-center gap-2 cursor-pointer">
                          <IconRenderer symbol={amenity.symbol} />
                          <span>{amenity.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Safety</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {config.amenities.safety.map(amenity => (
                      <div key={amenity.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity.value}
                          checked={formData.amenities.includes(amenity.value)}
                          onCheckedChange={() => handleAmenityToggle(amenity.value)}
                        />
                        <Label htmlFor={amenity.value} className="flex items-center gap-2 cursor-pointer">
                          <IconRenderer symbol={amenity.symbol} />
                          <span>{amenity.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Roommate Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Roommate Preferences
            </CardTitle>
            <CardDescription>Who are you looking for?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minAge">Min Age</Label>
                <Input
                  id="minAge"
                  type="number"
                  placeholder="22"
                  value={formData.minAge}
                  onChange={(e) => handleFieldChange("minAge", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="maxAge">Max Age</Label>
                <Input
                  id="maxAge"
                  type="number"
                  placeholder="35"
                  value={formData.maxAge}
                  onChange={(e) => handleFieldChange("maxAge", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="gender">Preferred Gender</Label>
                <Select value={formData.gender} onValueChange={(v) => handleFieldChange("gender", v)} disabled={!config?.genders || config.genders.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={config?.genders && config.genders.length > 0 ? "Select gender" : "No options available"} />
                  </SelectTrigger>
                  {config?.genders && config.genders.length > 0 && (
                    <SelectContent>
                      {config.genders.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <IconRenderer symbol={option.symbol} />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  )}
                </Select>
              </div>

              <div>
                <Label htmlFor="profession">Preferred Profession</Label>
                <Select value={formData.profession} onValueChange={(v) => handleFieldChange("profession", v)} disabled={!config?.professions || config.professions.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={config?.professions && config.professions.length > 0 ? "Select profession" : "No options available"} />
                  </SelectTrigger>
                  {config?.professions && config.professions.length > 0 && (
                    <SelectContent>
                      {config.professions.map(prof => (
                        <SelectItem key={prof.value} value={prof.value}>
                          <div className="flex items-center gap-2">
                            <IconRenderer symbol={prof.symbol} />
                            <span>{prof.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  )}
                </Select>
              </div>
            </div>

            <div>
              <Label>Lifestyle Preferences</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {config?.lifestylePreferences && config.lifestylePreferences.length > 0 ? (
                  config.lifestylePreferences.map(lifestyle => (
                    <div key={lifestyle.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lifestyle-${lifestyle.value}`}
                        checked={formData.lifestyle.includes(lifestyle.value)}
                        onCheckedChange={() => handleLifestyleToggle(lifestyle.value)}
                      />
                      <Label htmlFor={`lifestyle-${lifestyle.value}`} className="flex items-center gap-2 cursor-pointer">
                        <IconRenderer symbol={lifestyle.symbol} />
                        <span>{lifestyle.label}</span>
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No lifestyle preferences available</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Roommates */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Roommates</CardTitle>
            <CardDescription>Tell potential roommates about who they'll be living with</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.roommates.map((roommate, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Roommate {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRoommate(index)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Name"
                    value={roommate.name}
                    onChange={(e) => handleRoommateChange(index, "name", e.target.value)}
                  />
                  <Select
                    value={roommate.gender}
                    onValueChange={(v) => handleRoommateChange(index, "gender", v)}
                    disabled={!config?.genders || config.genders.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={config?.genders && config.genders.length > 0 ? "Gender" : "Loading..."} />
                    </SelectTrigger>
                    {config?.genders && config.genders.length > 0 && (
                      <SelectContent>
                        {config.genders.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <IconRenderer symbol={option.symbol} />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    )}
                  </Select>
                  <Input
                    type="number"
                    placeholder="Age"
                    value={roommate.age || ""}
                    onChange={(e) => handleRoommateChange(index, "age", parseInt(e.target.value))}
                  />
                  <Select
                    value={roommate.profession}
                    onValueChange={(v) => handleRoommateChange(index, "profession", v)}
                    disabled={!config?.professions || config.professions.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={config?.professions && config.professions.length > 0 ? "Profession" : "Loading..."} />
                    </SelectTrigger>
                    {config?.professions && config.professions.length > 0 && (
                      <SelectContent>
                        {config.professions.map(prof => (
                          <SelectItem key={prof.value} value={prof.value}>
                            <div className="flex items-center gap-2">
                              <IconRenderer symbol={prof.symbol} />
                              <span>{prof.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    )}
                  </Select>
                </div>
                <Textarea
                  placeholder="Bio"
                  value={roommate.bio}
                  onChange={(e) => handleRoommateChange(index, "bio", e.target.value)}
                  rows={2}
                />
              </div>
            ))}
            <Button variant="outline" onClick={handleAddRoommate} className="w-full">
              Add Roommate
            </Button>
          </CardContent>
        </Card>

        {/* Neighborhood */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Neighborhood
            </CardTitle>
            <CardDescription>Share your neighborhood experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="neighborhoodReview">Neighborhood Review</Label>
              <Textarea
                id="neighborhoodReview"
                placeholder="Tell us about the neighborhood..."
                value={formData.neighborhoodReview}
                onChange={(e) => handleFieldChange("neighborhoodReview", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Safety</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleNestedFieldChange("neighborhoodRatings", "safety", star)}
                      className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      aria-label={`Rate ${star} out of 5 stars for safety`}
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          star <= formData.neighborhoodRatings.safety
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-none text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {formData.neighborhoodRatings.safety > 0 ? `${formData.neighborhoodRatings.safety}/5` : "Not rated"}
                  </span>
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Connectivity</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleNestedFieldChange("neighborhoodRatings", "connectivity", star)}
                      className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      aria-label={`Rate ${star} out of 5 stars for connectivity`}
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          star <= formData.neighborhoodRatings.connectivity
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-none text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {formData.neighborhoodRatings.connectivity > 0 ? `${formData.neighborhoodRatings.connectivity}/5` : "Not rated"}
                  </span>
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Amenities</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleNestedFieldChange("neighborhoodRatings", "amenities", star)}
                      className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      aria-label={`Rate ${star} out of 5 stars for amenities`}
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          star <= formData.neighborhoodRatings.amenities
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-none text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {formData.neighborhoodRatings.amenities > 0 ? `${formData.neighborhoodRatings.amenities}/5` : "Not rated"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        <div className="flex justify-end gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate("/")}>
            Cancel
          </Button>
          <Button onClick={handleSave} size="lg" disabled={saving || loading}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {listingId ? "Updating..." : "Saving..."}
              </>
            ) : (
              listingId ? "Update Listing" : "Save Listing"
            )}
          </Button>
        </div>

        {/* Property Photos - Only show after listing is saved */}
        {listingId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Property Photos
              </CardTitle>
              <CardDescription>Upload 3-8 photos of your property (Minimum 3 required)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Image Preview Grid */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Property photo ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }));
                          }}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove photo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <div>
                  <input
                    type="file"
                    id="property-photo-upload"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    capture="environment"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={uploadingImages || formData.images.length >= 8}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("property-photo-upload")?.click()}
                    disabled={uploadingImages || formData.images.length >= 8}
                  >
                    {uploadingImages ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="mr-2 h-4 w-4" />
                        {formData.images.length > 0 ? "Add More Photos" : "Upload Photos"}
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    {formData.images.length}/8 photos uploaded {formData.images.length < 3 && `(${3 - formData.images.length} more required)`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Neighborhood Photos - Only show after listing is saved */}
        {listingId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Neighborhood Photos
              </CardTitle>
              <CardDescription>Upload 3-8 photos of the neighborhood (Minimum 3 required)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Image Preview Grid */}
                {formData.neighborhoodImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.neighborhoodImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Neighborhood photo ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              neighborhoodImages: prev.neighborhoodImages.filter((_, i) => i !== index)
                            }));
                          }}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove photo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <div>
                  <input
                    type="file"
                    id="neighborhood-photo-upload"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    capture="environment"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0 || !listingId) return;

                      setUploadingImages(true);
                      try {
                        const uploadPromises = Array.from(files).map(async (file) => {
                          const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                          if (!validTypes.includes(file.type)) {
                            throw new Error(`Invalid file type: ${file.type}`);
                          }

                          const { uploadUrl, photoUrl } = await apiClient.getPhotoUploadUrl(
                            listingId,
                            file.type,
                            file.name
                          );

                          const uploadResponse = await fetch(uploadUrl, {
                            method: 'PUT',
                            body: file,
                            headers: { 'Content-Type': file.type },
                          });

                          if (!uploadResponse.ok) {
                            throw new Error(`Failed to upload ${file.name}`);
                          }

                          return photoUrl;
                        });

                        const uploadedUrls = await Promise.all(uploadPromises);
                        
                        setFormData(prev => ({
                          ...prev,
                          neighborhoodImages: [...prev.neighborhoodImages, ...uploadedUrls]
                        }));

                        toast({
                          title: "Success",
                          description: `${uploadedUrls.length} photo(s) uploaded successfully`,
                        });
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error?.message || "Failed to upload photos",
                          variant: "destructive",
                        });
                      } finally {
                        setUploadingImages(false);
                        e.target.value = '';
                      }
                    }}
                    disabled={uploadingImages || formData.neighborhoodImages.length >= 8}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("neighborhood-photo-upload")?.click()}
                    disabled={uploadingImages || formData.neighborhoodImages.length >= 8}
                  >
                    {uploadingImages ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="mr-2 h-4 w-4" />
                        {formData.neighborhoodImages.length > 0 ? "Add More Photos" : "Upload Photos"}
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    {formData.neighborhoodImages.length}/8 photos uploaded {formData.neighborhoodImages.length < 3 && `(${3 - formData.neighborhoodImages.length} more required)`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}
