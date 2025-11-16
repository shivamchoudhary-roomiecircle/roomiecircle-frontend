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
import { Loader2, Home, DollarSign, MapPin, Bed, Users, Star, X, Upload, Image as ImageIcon } from "lucide-react";
import { LocationAutocomplete } from "@/components/search/LocationAutocomplete";
import { IconRenderer } from "@/lib/iconMapper";

interface RoommateData {
  name: string;
  gender: string;
  age: number;
  profession: string;
  bio: string;
}

export default function EditListing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get("id");
  const { config, loading: configLoading } = useConfig();
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  
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
  });

  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [neighborhoodImages, setNeighborhoodImages] = useState<string[]>([]);

  const [currentRoommate, setCurrentRoommate] = useState<RoommateData>({
    name: "",
    gender: "",
    age: 0,
    profession: "",
    bio: "",
  });

  // Fetch listing data
  useEffect(() => {
    const fetchListingData = async () => {
      if (!listingId) return;
      
      try {
        setLoading(true);
        const response = await apiClient.getRoomListing(listingId);
        const listing = response.data || response;
        
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
          amenities: listing.amenities || [],
          minAge: listing.preferences?.minAge ? listing.preferences.minAge.toString() : "",
          maxAge: listing.preferences?.maxAge ? listing.preferences.maxAge.toString() : "",
          gender: listing.preferences?.gender || "",
          profession: listing.preferences?.profession || "",
          lifestyle: listing.preferences?.lifestyle || [],
          roommates: listing.roommates || [],
          neighborhoodReview: listing.neighborhoodReview || "",
          neighborhoodRatings: listing.neighborhoodRatings || {
            safety: 0,
            connectivity: 0,
            amenities: 0,
          },
        });

        setPropertyImages(listing.photos || []);
        setNeighborhoodImages(listing.neighborhoodImages || []);
      } catch (error: any) {
        console.error("Error fetching listing:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load listing",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListingData();
  }, [listingId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectToggle = (name: string, value: string) => {
    setFormData(prev => {
      const currentValue = prev[name as keyof typeof prev];
      if (Array.isArray(currentValue) && typeof currentValue[0] === 'string') {
        const stringArray = currentValue as string[];
        return {
          ...prev,
          [name]: stringArray.includes(value)
            ? stringArray.filter(item => item !== value)
            : [...stringArray, value]
        };
      }
      return prev;
    });
  };

  const addRoommate = () => {
    if (currentRoommate.name && currentRoommate.gender && currentRoommate.age) {
      setFormData(prev => ({
        ...prev,
        roommates: [...prev.roommates, currentRoommate]
      }));
      setCurrentRoommate({
        name: "",
        gender: "",
        age: 0,
        profession: "",
        bio: "",
      });
    }
  };

  const removeRoommate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      roommates: prev.roommates.filter((_, i) => i !== index)
    }));
  };

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

    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    setNeighborhoodImages(prev => [...prev, ...newImages]);
  };

  const removePropertyImage = (index: number) => {
    setPropertyImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNeighborhoodImage = (index: number) => {
    setNeighborhoodImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateListing = async () => {
    if (propertyImages.length < 3) {
      toast({
        title: "Not enough photos",
        description: "Please upload at least 3 property photos",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const payload = {
        description: formData.description,
        monthlyRent: parseFloat(formData.monthlyRent),
        maintenance: formData.maintenance ? parseFloat(formData.maintenance) : 0,
        maintenanceIncluded: formData.maintenanceIncluded,
        deposit: parseFloat(formData.deposit),
        availableDate: formData.availableDate,
        addressText: formData.addressText,
        placeId: formData.placeId,
        latitude: formData.latitude,
        longitude: formData.longitude,
        roomType: formData.roomType,
        propertyType: formData.propertyType,
        bhkType: formData.bhkType,
        floor: parseInt(formData.floor),
        hasBalcony: formData.hasBalcony,
        hasPrivateWashroom: formData.hasPrivateWashroom,
        hasFurniture: formData.hasFurniture,
        amenities: formData.amenities,
        preferences: {
          minAge: formData.minAge ? parseInt(formData.minAge) : null,
          maxAge: formData.maxAge ? parseInt(formData.maxAge) : null,
          gender: formData.gender,
          profession: formData.profession,
          lifestyle: formData.lifestyle,
        },
        roommates: formData.roommates,
        neighborhoodReview: formData.neighborhoodReview,
        neighborhoodRatings: formData.neighborhoodRatings,
        photos: propertyImages,
        neighborhoodImages: neighborhoodImages,
      };

      // Add your update API call here
      // await apiClient.updateRoomListing(listingId, payload);
      
      toast({
        title: "Success",
        description: "Listing updated successfully!",
      });

      navigate(`/dashboard`);
    } catch (error: any) {
      console.error("Error updating listing:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update listing",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (configLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Listing</h1>
          <p className="text-muted-foreground">Update your listing details</p>
        </div>

        <div className="space-y-6">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Basic Details
              </CardTitle>
              <CardDescription>Tell us about your property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your room and property..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roomType">Room Type</Label>
                  <Select value={formData.roomType} onValueChange={(value) => handleSelectChange("roomType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {config?.roomTypes?.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bhkType">BHK Type</Label>
                  <Select value={formData.bhkType} onValueChange={(value) => handleSelectChange("bhkType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select BHK type" />
                    </SelectTrigger>
                    <SelectContent>
                      {config?.bhkTypes?.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Property Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {config?.propertyTypes?.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`property-${type.value}`}
                        checked={formData.propertyType.includes(type.value)}
                        onCheckedChange={(checked) => handleMultiSelectToggle("propertyType", type.value)}
                      />
                      <Label htmlFor={`property-${type.value}`} className="cursor-pointer">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    name="floor"
                    type="number"
                    value={formData.floor}
                    onChange={handleInputChange}
                    placeholder="e.g., 3"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasBalcony"
                    checked={formData.hasBalcony}
                    onCheckedChange={(checked) => handleCheckboxChange("hasBalcony", checked as boolean)}
                  />
                  <Label htmlFor="hasBalcony" className="cursor-pointer">Has Balcony</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasPrivateWashroom"
                    checked={formData.hasPrivateWashroom}
                    onCheckedChange={(checked) => handleCheckboxChange("hasPrivateWashroom", checked as boolean)}
                  />
                  <Label htmlFor="hasPrivateWashroom" className="cursor-pointer">Private Washroom</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasFurniture"
                    checked={formData.hasFurniture}
                    onCheckedChange={(checked) => handleCheckboxChange("hasFurniture", checked as boolean)}
                  />
                  <Label htmlFor="hasFurniture" className="cursor-pointer">Furnished</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing & Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthlyRent">Monthly Rent (₹)</Label>
                  <Input
                    id="monthlyRent"
                    name="monthlyRent"
                    type="number"
                    value={formData.monthlyRent}
                    onChange={handleInputChange}
                    placeholder="e.g., 15000"
                  />
                </div>

                <div>
                  <Label htmlFor="deposit">Deposit (₹)</Label>
                  <Input
                    id="deposit"
                    name="deposit"
                    type="number"
                    value={formData.deposit}
                    onChange={handleInputChange}
                    placeholder="e.g., 30000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maintenance">Maintenance (₹)</Label>
                  <Input
                    id="maintenance"
                    name="maintenance"
                    type="number"
                    value={formData.maintenance}
                    onChange={handleInputChange}
                    placeholder="e.g., 2000"
                  />
                </div>

                <div className="flex items-center space-x-2 mt-8">
                  <Checkbox
                    id="maintenanceIncluded"
                    checked={formData.maintenanceIncluded}
                    onCheckedChange={(checked) => handleCheckboxChange("maintenanceIncluded", checked as boolean)}
                  />
                  <Label htmlFor="maintenanceIncluded" className="cursor-pointer">Included in rent</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="availableDate">Available From</Label>
                <Input
                  id="availableDate"
                  name="availableDate"
                  type="date"
                  value={formData.availableDate}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label>Address</Label>
              <LocationAutocomplete 
                value={formData.addressText}
                onChange={(value, placeId) => {
                  setFormData(prev => ({
                    ...prev,
                    addressText: value,
                    placeId: placeId || ""
                  }));
                }}
              />
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Amenities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {config?.amenities && Object.values(config.amenities).flat().map((amenity) => (
                  <div key={amenity.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${amenity.value}`}
                      checked={formData.amenities.includes(amenity.value)}
                      onCheckedChange={(checked) => handleMultiSelectToggle("amenities", amenity.value)}
                    />
                    <Label htmlFor={`amenity-${amenity.value}`} className="cursor-pointer flex items-center gap-2">
                      <IconRenderer symbol={amenity.icon} className="h-4 w-4" />
                      {amenity.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Roommate Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Roommate Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="minAge">Min Age</Label>
                  <Input
                    id="minAge"
                    name="minAge"
                    type="number"
                    value={formData.minAge}
                    onChange={handleInputChange}
                    placeholder="e.g., 21"
                  />
                </div>
                <div>
                  <Label htmlFor="maxAge">Max Age</Label>
                  <Input
                    id="maxAge"
                    name="maxAge"
                    type="number"
                    value={formData.maxAge}
                    onChange={handleInputChange}
                    placeholder="e.g., 35"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender Preference</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="profession">Profession Preference</Label>
                <Input
                  id="profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleInputChange}
                  placeholder="e.g., Working Professional, Student"
                />
              </div>

              <div>
                <Label>Lifestyle Preferences</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {config?.lifestylePreferences?.map((lifestyle) => (
                    <div key={lifestyle.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lifestyle-${lifestyle.value}`}
                        checked={formData.lifestyle.includes(lifestyle.value)}
                        onCheckedChange={(checked) => handleMultiSelectToggle("lifestyle", lifestyle.value)}
                      />
                      <Label htmlFor={`lifestyle-${lifestyle.value}`} className="cursor-pointer">
                        {lifestyle.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Existing Roommates */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Roommates</CardTitle>
              <CardDescription>Add information about current roommates (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.roommates.length > 0 && (
                <div className="space-y-2">
                  {formData.roommates.map((roommate, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{roommate.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {roommate.age} • {roommate.gender} • {roommate.profession}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRoommate(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={currentRoommate.name}
                    onChange={(e) => setCurrentRoommate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Roommate name"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select
                    value={currentRoommate.gender}
                    onValueChange={(value) => setCurrentRoommate(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={currentRoommate.age || ""}
                    onChange={(e) => setCurrentRoommate(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                    placeholder="Age"
                  />
                </div>
                <div>
                  <Label>Profession</Label>
                  <Input
                    value={currentRoommate.profession}
                    onChange={(e) => setCurrentRoommate(prev => ({ ...prev, profession: e.target.value }))}
                    placeholder="e.g., Software Engineer"
                  />
                </div>
              </div>

              <div>
                <Label>Bio</Label>
                <Textarea
                  value={currentRoommate.bio}
                  onChange={(e) => setCurrentRoommate(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Brief description..."
                  rows={2}
                />
              </div>

              <Button type="button" variant="outline" onClick={addRoommate}>
                Add Roommate
              </Button>
            </CardContent>
          </Card>

          {/* Neighborhood */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Neighborhood Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="neighborhoodReview">Your Review</Label>
                <Textarea
                  id="neighborhoodReview"
                  name="neighborhoodReview"
                  value={formData.neighborhoodReview}
                  onChange={handleInputChange}
                  placeholder="Tell us about the neighborhood..."
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Safety ({formData.neighborhoodRatings.safety}/5)</Label>
                  <Input
                    type="range"
                    min="0"
                    max="5"
                    value={formData.neighborhoodRatings.safety}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      neighborhoodRatings: {
                        ...prev.neighborhoodRatings,
                        safety: parseInt(e.target.value)
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label>Connectivity ({formData.neighborhoodRatings.connectivity}/5)</Label>
                  <Input
                    type="range"
                    min="0"
                    max="5"
                    value={formData.neighborhoodRatings.connectivity}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      neighborhoodRatings: {
                        ...prev.neighborhoodRatings,
                        connectivity: parseInt(e.target.value)
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label>Amenities ({formData.neighborhoodRatings.amenities}/5)</Label>
                  <Input
                    type="range"
                    min="0"
                    max="5"
                    value={formData.neighborhoodRatings.amenities}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      neighborhoodRatings: {
                        ...prev.neighborhoodRatings,
                        amenities: parseInt(e.target.value)
                      }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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

          {/* Update Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateListing}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Listing
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

