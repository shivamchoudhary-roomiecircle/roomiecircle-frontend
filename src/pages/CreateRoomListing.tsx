import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { useConfig } from "@/contexts/ConfigContext";
import { useDebounce } from "@/hooks/useDebounce";
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
import { Loader2, Home, DollarSign, MapPin, Bed, Users, Image as ImageIcon, Star } from "lucide-react";
import { LocationAutocomplete } from "@/components/search/LocationAutocomplete";

interface RoommateData {
  name: string;
  gender: string;
  age: number;
  profession: string;
  bio: string;
}

export default function CreateRoomListing() {
  const navigate = useNavigate();
  const { config, loading: configLoading } = useConfig();
  
  const [listingId, setListingId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [saving, setSaving] = useState(false);
  
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
    propertyType: "",
    bhkType: "",
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

  const debouncedFormData = useDebounce(formData, 800);

  // Initialize - create draft on mount
  useEffect(() => {
    const initializeListing = async () => {
      try {
        const draft = await apiClient.createRoomListing();
        setListingId(draft.id);
        toast({
          title: "Draft Created",
          description: "Your listing draft has been created. Changes will auto-save.",
        });
      } catch (error) {
        console.error("Failed to create draft:", error);
        toast({
          title: "Error",
          description: "Failed to create listing draft. Please try again.",
          variant: "destructive",
        });
      } finally {
        setInitializing(false);
      }
    };

    initializeListing();
  }, []);

  // Auto-save when form data changes
  useEffect(() => {
    if (!listingId || initializing) return;

    const saveChanges = async () => {
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
        if (formData.propertyType) payload.propertyType = formData.propertyType;
        if (formData.bhkType) payload.bhkType = formData.bhkType;
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

        await apiClient.updateRoomListing(listingId, payload);
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        setSaving(false);
      }
    };

    saveChanges();
  }, [debouncedFormData, listingId, initializing]);

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

  const handlePublish = async () => {
    if (!listingId) return;
    
    try {
      await apiClient.updateListingStatus(listingId, "ACTIVE");
      toast({
        title: "Success",
        description: "Your listing has been published!",
      });
      navigate("/my-listings");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (initializing || configLoading) {
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">List Your Room</h1>
            <p className="text-muted-foreground mt-1">
              Changes save automatically • {saving && "Saving..."}
            </p>
          </div>
          <Button onClick={handlePublish} size="lg">
            Publish Listing
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
                <Select value={formData.roomType} onValueChange={(v) => handleFieldChange("roomType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {config?.roomTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <Select value={formData.propertyType} onValueChange={(v) => handleFieldChange("propertyType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {config?.propertyTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bhkType">BHK Type</Label>
                <Select value={formData.bhkType} onValueChange={(v) => handleFieldChange("bhkType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select BHK type" />
                  </SelectTrigger>
                  <SelectContent>
                    {config?.bhkTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                        <Label htmlFor={amenity.value}>{amenity.label}</Label>
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
                        <Label htmlFor={amenity.value}>{amenity.label}</Label>
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
                        <Label htmlFor={amenity.value}>{amenity.label}</Label>
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
                <Select value={formData.gender} onValueChange={(v) => handleFieldChange("gender", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {config?.genderOptions?.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="profession">Preferred Profession</Label>
                <Select value={formData.profession} onValueChange={(v) => handleFieldChange("profession", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select profession" />
                  </SelectTrigger>
                  <SelectContent>
                    {config?.professions?.map(prof => (
                      <SelectItem key={prof.value} value={prof.value}>{prof.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Lifestyle Preferences</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {config?.lifestyleTags?.map(lifestyle => (
                  <div key={lifestyle.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`lifestyle-${lifestyle.value}`}
                      checked={formData.lifestyle.includes(lifestyle.value)}
                      onCheckedChange={() => handleLifestyleToggle(lifestyle.value)}
                    />
                    <Label htmlFor={`lifestyle-${lifestyle.value}`}>{lifestyle.label}</Label>
                  </div>
                ))}
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
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {config?.genderOptions?.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Age"
                    value={roommate.age || ""}
                    onChange={(e) => handleRoommateChange(index, "age", parseInt(e.target.value))}
                  />
                  <Input
                    placeholder="Profession"
                    value={roommate.profession}
                    onChange={(e) => handleRoommateChange(index, "profession", e.target.value)}
                  />
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

            <div className="space-y-3">
              <div>
                <Label>Safety: {formData.neighborhoodRatings.safety}/5</Label>
                <Input
                  type="range"
                  min="0"
                  max="5"
                  value={formData.neighborhoodRatings.safety}
                  onChange={(e) => handleNestedFieldChange("neighborhoodRatings", "safety", parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label>Connectivity: {formData.neighborhoodRatings.connectivity}/5</Label>
                <Input
                  type="range"
                  min="0"
                  max="5"
                  value={formData.neighborhoodRatings.connectivity}
                  onChange={(e) => handleNestedFieldChange("neighborhoodRatings", "connectivity", parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label>Amenities: {formData.neighborhoodRatings.amenities}/5</Label>
                <Input
                  type="range"
                  min="0"
                  max="5"
                  value={formData.neighborhoodRatings.amenities}
                  onChange={(e) => handleNestedFieldChange("neighborhoodRatings", "amenities", parseInt(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Photos
            </CardTitle>
            <CardDescription>Add photos of your room (Coming soon: Upload functionality)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Photo upload functionality will be added in the next iteration.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Cancel
          </Button>
          <Button onClick={handlePublish} size="lg">
            Publish Listing
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
