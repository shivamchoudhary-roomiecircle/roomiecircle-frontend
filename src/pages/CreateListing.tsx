import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { Loader2, Upload, X, Star } from "lucide-react";
import { LocationAutocomplete } from "@/components/search/LocationAutocomplete";

const CreateListing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [listingId, setListingId] = useState<string>("");
  const [config, setConfig] = useState<any>(null);
  const [currentSection, setCurrentSection] = useState(0);

  // Form states
  const [basicInfo, setBasicInfo] = useState({
    description: "",
    latitude: null as number | null,
    longitude: null as number | null,
    addressText: "",
    placeId: "",
    monthlyRent: "",
    maintenance: "",
    maintenanceIncluded: true,
    deposit: "",
    availableDate: "",
    listingType: "",
  });

  const [details, setDetails] = useState({
    propertyType: [] as string[],
    layoutType: "",
    hasBalcony: false,
    hasPrivateWashroom: false,
    hasFurniture: false,
    bedroomCount: "",
    washroomCount: "",
    balconyCount: "",
  });

  const [amenities, setAmenities] = useState({
    inHome: [] as string[],
    onProperty: [] as string[],
    safety: [] as string[],
  });

  const [roommatePreferences, setRoommatePreferences] = useState({
    minAge: "",
    maxAge: "",
    gender: "",
    profession: "",
    renteeType: "",
    lifestyle: [] as string[],
  });

  const [currentRoommates, setCurrentRoommates] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [neighborhood, setNeighborhood] = useState({
    review: "",
    ratings: {
      food: 0,
      public_transport: 0,
      walkable_safe: 0,
    },
  });

  useEffect(() => {
    initializeListing();
  }, []);

  const initializeListing = async () => {
    try {
      setLoading(true);
      
      // Create draft listing
      const listing = await apiClient.createListing();
      setListingId(listing.id);
      
      // Load configuration
      const configData = await apiClient.getConfiguration();
      setConfig(configData);
      
      toast({
        title: "Success",
        description: "Listing draft created. Let's add details!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initialize listing",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const saveBasicInfo = async () => {
    try {
      setLoading(true);
      await apiClient.updateListing(listingId, {
        basicInfo: {
          ...basicInfo,
          monthlyRent: parseInt(basicInfo.monthlyRent),
          maintenance: parseInt(basicInfo.maintenance),
          deposit: parseInt(basicInfo.deposit),
        },
      });
      toast({ title: "Basic info saved!" });
      setCurrentSection(1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDetails = async () => {
    try {
      setLoading(true);
      await apiClient.updateListing(listingId, {
        details: {
          ...details,
          bedroomCount: details.bedroomCount ? parseInt(details.bedroomCount) : undefined,
          washroomCount: details.washroomCount ? parseInt(details.washroomCount) : undefined,
          balconyCount: details.balconyCount ? parseInt(details.balconyCount) : undefined,
        },
      });
      toast({ title: "Details saved!" });
      setCurrentSection(2);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAmenities = async () => {
    try {
      setLoading(true);
      const amenitiesData = [
        ...amenities.inHome,
        ...amenities.onProperty,
        ...amenities.safety,
      ];
      await apiClient.updateListing(listingId, {
        amenities: amenitiesData,
      });
      toast({ title: "Amenities saved!" });
      setCurrentSection(3);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveRoommatePreferences = async () => {
    try {
      setLoading(true);
      await apiClient.updateListing(listingId, {
        roommatePreferences: {
          ...roommatePreferences,
          minAge: parseInt(roommatePreferences.minAge),
          maxAge: parseInt(roommatePreferences.maxAge),
        },
      });
      toast({ title: "Roommate preferences saved!" });
      setCurrentSection(4);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentRoommates = async () => {
    try {
      setLoading(true);
      await apiClient.updateListing(listingId, {
        existingRoommates: currentRoommates,
      });
      toast({ title: "Roommates saved!" });
      setCurrentSection(5);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveImages = async () => {
    try {
      setLoading(true);
      await apiClient.updateListing(listingId, {
        images,
      });
      toast({ title: "Images saved!" });
      setCurrentSection(6);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveNeighborhood = async () => {
    try {
      setLoading(true);
      await apiClient.updateListing(listingId, {
        neighborhood,
      });
      toast({ 
        title: "Success!", 
        description: "Listing completed successfully" 
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRoommate = () => {
    setCurrentRoommates([
      ...currentRoommates,
      { name: "", age: "", profession: "", gender: "", sharingRoom: false },
    ]);
  };

  const updateRoommate = (index: number, field: string, value: any) => {
    const updated = [...currentRoommates];
    updated[index] = { ...updated[index], [field]: value };
    setCurrentRoommates(updated);
  };

  const removeRoommate = (index: number) => {
    setCurrentRoommates(currentRoommates.filter((_, i) => i !== index));
  };

  if (loading && !config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sections = [
    { title: "Basic Information", component: renderBasicInfo, save: saveBasicInfo },
    { title: "Property Details", component: renderDetails, save: saveDetails },
    { title: "Amenities", component: renderAmenities, save: saveAmenities },
    { title: "Roommate Preferences", component: renderRoommatePreferences, save: saveRoommatePreferences },
    { title: "Current Roommates", component: renderCurrentRoommates, save: saveCurrentRoommates },
    { title: "Photos", component: renderImages, save: saveImages },
    { title: "Neighborhood", component: renderNeighborhood, save: saveNeighborhood },
  ];

  function renderBasicInfo() {
    return (
      <div className="space-y-4">
        <div>
          <Label>Listing Type</Label>
          <Select 
            value={basicInfo.listingType} 
            onValueChange={(value) => setBasicInfo({ ...basicInfo, listingType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select listing type" />
            </SelectTrigger>
            <SelectContent>
              {config?.LISTING_TYPE?.map((type: any) => (
                <SelectItem key={type.key} value={type.key}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={basicInfo.description}
            onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
            placeholder="Describe your property..."
            rows={4}
          />
        </div>

        <div>
          <Label>Location</Label>
          <LocationAutocomplete
            value={basicInfo.addressText}
            onChange={(value, placeId) => {
              setBasicInfo({
                ...basicInfo,
                addressText: value,
                placeId: placeId || "",
              });
            }}
            placeholder="Enter your property location"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Monthly Rent (₹)</Label>
            <Input
              type="number"
              value={basicInfo.monthlyRent}
              onChange={(e) => setBasicInfo({ ...basicInfo, monthlyRent: e.target.value })}
              placeholder="25000"
            />
          </div>

          <div>
            <Label>Deposit (₹)</Label>
            <Input
              type="number"
              value={basicInfo.deposit}
              onChange={(e) => setBasicInfo({ ...basicInfo, deposit: e.target.value })}
              placeholder="50000"
            />
          </div>

          <div>
            <Label>Maintenance (₹)</Label>
            <Input
              type="number"
              value={basicInfo.maintenance}
              onChange={(e) => setBasicInfo({ ...basicInfo, maintenance: e.target.value })}
              placeholder="2000"
            />
          </div>

          <div>
            <Label>Available From</Label>
            <Input
              type="date"
              value={basicInfo.availableDate}
              onChange={(e) => setBasicInfo({ ...basicInfo, availableDate: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            checked={basicInfo.maintenanceIncluded}
            onCheckedChange={(checked) => 
              setBasicInfo({ ...basicInfo, maintenanceIncluded: checked as boolean })
            }
          />
          <Label>Maintenance included in rent</Label>
        </div>
      </div>
    );
  }

  function renderDetails() {
    const isFullHouse = basicInfo.listingType === "full_house";
    
    return (
      <div className="space-y-4">
        <div>
          <Label>Property Type</Label>
          <div className="space-y-2 mt-2">
            {config?.PROPERTY_TYPE?.map((type: any) => (
              <div key={type.key} className="flex items-center space-x-2">
                <Checkbox
                  checked={details.propertyType.includes(type.key)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setDetails({ ...details, propertyType: [...details.propertyType, type.key] });
                    } else {
                      setDetails({ 
                        ...details, 
                        propertyType: details.propertyType.filter(t => t !== type.key) 
                      });
                    }
                  }}
                />
                <Label>{type.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Layout Type</Label>
          <Select 
            value={details.layoutType} 
            onValueChange={(value) => setDetails({ ...details, layoutType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select layout" />
            </SelectTrigger>
            <SelectContent>
              {config?.LAYOUT_TYPE?.map((type: any) => (
                <SelectItem key={type.key} value={type.key}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isFullHouse && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Bedrooms</Label>
              <Input
                type="number"
                value={details.bedroomCount}
                onChange={(e) => setDetails({ ...details, bedroomCount: e.target.value })}
                placeholder="2"
              />
            </div>

            <div>
              <Label>Bathrooms</Label>
              <Input
                type="number"
                value={details.washroomCount}
                onChange={(e) => setDetails({ ...details, washroomCount: e.target.value })}
                placeholder="2"
              />
            </div>

            <div>
              <Label>Balconies</Label>
              <Input
                type="number"
                value={details.balconyCount}
                onChange={(e) => setDetails({ ...details, balconyCount: e.target.value })}
                placeholder="1"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={details.hasBalcony}
              onCheckedChange={(checked) => setDetails({ ...details, hasBalcony: checked as boolean })}
            />
            <Label>Has Balcony</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={details.hasPrivateWashroom}
              onCheckedChange={(checked) => setDetails({ ...details, hasPrivateWashroom: checked as boolean })}
            />
            <Label>Has Private Washroom</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={details.hasFurniture}
              onCheckedChange={(checked) => setDetails({ ...details, hasFurniture: checked as boolean })}
            />
            <Label>Furnished</Label>
          </div>
        </div>
      </div>
    );
  }

  function renderAmenities() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">In Home</h3>
          <div className="space-y-2">
            {config?.AMENITY_IN_HOME?.map((amenity: any) => (
              <div key={amenity.key} className="flex items-center space-x-2">
                <Checkbox
                  checked={amenities.inHome.includes(amenity.key)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setAmenities({ ...amenities, inHome: [...amenities.inHome, amenity.key] });
                    } else {
                      setAmenities({ 
                        ...amenities, 
                        inHome: amenities.inHome.filter(a => a !== amenity.key) 
                      });
                    }
                  }}
                />
                <Label>{amenity.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">On Property</h3>
          <div className="space-y-2">
            {config?.AMENITY_ON_PROPERTY?.map((amenity: any) => (
              <div key={amenity.key} className="flex items-center space-x-2">
                <Checkbox
                  checked={amenities.onProperty.includes(amenity.key)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setAmenities({ ...amenities, onProperty: [...amenities.onProperty, amenity.key] });
                    } else {
                      setAmenities({ 
                        ...amenities, 
                        onProperty: amenities.onProperty.filter(a => a !== amenity.key) 
                      });
                    }
                  }}
                />
                <Label>{amenity.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Safety</h3>
          <div className="space-y-2">
            {config?.AMENITY_SAFETY?.map((amenity: any) => (
              <div key={amenity.key} className="flex items-center space-x-2">
                <Checkbox
                  checked={amenities.safety.includes(amenity.key)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setAmenities({ ...amenities, safety: [...amenities.safety, amenity.key] });
                    } else {
                      setAmenities({ 
                        ...amenities, 
                        safety: amenities.safety.filter(a => a !== amenity.key) 
                      });
                    }
                  }}
                />
                <Label>{amenity.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderRoommatePreferences() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Minimum Age</Label>
            <Input
              type="number"
              value={roommatePreferences.minAge}
              onChange={(e) => setRoommatePreferences({ ...roommatePreferences, minAge: e.target.value })}
              placeholder="18"
            />
          </div>

          <div>
            <Label>Maximum Age</Label>
            <Input
              type="number"
              value={roommatePreferences.maxAge}
              onChange={(e) => setRoommatePreferences({ ...roommatePreferences, maxAge: e.target.value })}
              placeholder="35"
            />
          </div>
        </div>

        <div>
          <Label>Gender Preference</Label>
          <Select 
            value={roommatePreferences.gender} 
            onValueChange={(value) => setRoommatePreferences({ ...roommatePreferences, gender: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="any">Any</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Profession</Label>
          <Select 
            value={roommatePreferences.profession} 
            onValueChange={(value) => setRoommatePreferences({ ...roommatePreferences, profession: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select profession" />
            </SelectTrigger>
            <SelectContent>
              {config?.PROFESSION?.map((prof: any) => (
                <SelectItem key={prof.key} value={prof.key}>
                  {prof.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Rentee Type</Label>
          <Select 
            value={roommatePreferences.renteeType} 
            onValueChange={(value) => setRoommatePreferences({ ...roommatePreferences, renteeType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select rentee type" />
            </SelectTrigger>
            <SelectContent>
              {config?.RENTEE_TYPE?.map((type: any) => (
                <SelectItem key={type.key} value={type.key}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Lifestyle Preferences</Label>
          <div className="space-y-2 mt-2">
            {config?.LIFESTYLE_TAG?.map((tag: any) => (
              <div key={tag.key} className="flex items-center space-x-2">
                <Checkbox
                  checked={roommatePreferences.lifestyle.includes(tag.key)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setRoommatePreferences({ 
                        ...roommatePreferences, 
                        lifestyle: [...roommatePreferences.lifestyle, tag.key] 
                      });
                    } else {
                      setRoommatePreferences({ 
                        ...roommatePreferences, 
                        lifestyle: roommatePreferences.lifestyle.filter(l => l !== tag.key) 
                      });
                    }
                  }}
                />
                <Label>{tag.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderCurrentRoommates() {
    return (
      <div className="space-y-4">
        {currentRoommates.map((roommate, index) => (
          <Card key={index}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Roommate {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRoommate(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={roommate.name}
                    onChange={(e) => updateRoommate(index, "name", e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={roommate.age}
                    onChange={(e) => updateRoommate(index, "age", e.target.value)}
                    placeholder="25"
                  />
                </div>

                <div>
                  <Label>Profession</Label>
                  <Select 
                    value={roommate.profession} 
                    onValueChange={(value) => updateRoommate(index, "profession", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select profession" />
                    </SelectTrigger>
                    <SelectContent>
                      {config?.PROFESSION?.map((prof: any) => (
                        <SelectItem key={prof.key} value={prof.key}>
                          {prof.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Gender</Label>
                  <Select 
                    value={roommate.gender} 
                    onValueChange={(value) => updateRoommate(index, "gender", value)}
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

              {basicInfo.listingType === "shared_room" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={roommate.sharingRoom}
                    onCheckedChange={(checked) => updateRoommate(index, "sharingRoom", checked)}
                  />
                  <Label>Sharing this room</Label>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <Button onClick={addRoommate} variant="outline" className="w-full">
          Add Roommate
        </Button>
      </div>
    );
  }

  function renderImages() {
    return (
      <div className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">
            Click to upload or drag and drop images
          </p>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = e.target.files;
              if (files) {
                // TODO: Implement presigned URL upload
                toast({
                  title: "Upload pending",
                  description: "Image upload will be implemented with presigned URLs",
                });
              }
            }}
            className="max-w-xs mx-auto"
          />
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                <img src={image} alt={`Upload ${index + 1}`} className="object-cover w-full h-full" />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setImages(images.filter((_, i) => i !== index))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderNeighborhood() {
    return (
      <div className="space-y-4">
        <div>
          <Label>Neighborhood Review</Label>
          <Textarea
            value={neighborhood.review}
            onChange={(e) => setNeighborhood({ ...neighborhood, review: e.target.value })}
            placeholder="Tell us about the neighborhood..."
            rows={4}
          />
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Rate the neighborhood</h3>
          
          <div>
            <Label className="flex items-center justify-between mb-2">
              <span>Food & Dining</span>
              <span className="text-primary">{neighborhood.ratings.food}/5</span>
            </Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNeighborhood({
                    ...neighborhood,
                    ratings: { ...neighborhood.ratings, food: star }
                  })}
                  className="focus:outline-none"
                >
                  <Star 
                    className={`h-6 w-6 ${star <= neighborhood.ratings.food ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="flex items-center justify-between mb-2">
              <span>Public Transport</span>
              <span className="text-primary">{neighborhood.ratings.public_transport}/5</span>
            </Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNeighborhood({
                    ...neighborhood,
                    ratings: { ...neighborhood.ratings, public_transport: star }
                  })}
                  className="focus:outline-none"
                >
                  <Star 
                    className={`h-6 w-6 ${star <= neighborhood.ratings.public_transport ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="flex items-center justify-between mb-2">
              <span>Walkable & Safe</span>
              <span className="text-primary">{neighborhood.ratings.walkable_safe}/5</span>
            </Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNeighborhood({
                    ...neighborhood,
                    ratings: { ...neighborhood.ratings, walkable_safe: star }
                  })}
                  className="focus:outline-none"
                >
                  <Star 
                    className={`h-6 w-6 ${star <= neighborhood.ratings.walkable_safe ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentSectionData = sections[currentSection];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Your Listing</h1>
          <p className="text-muted-foreground">
            Section {currentSection + 1} of {sections.length}: {currentSectionData.title}
          </p>
          
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{currentSectionData.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentSectionData.component()}
            
            <div className="flex gap-4 mt-6">
              {currentSection > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentSection(currentSection - 1)}
                  disabled={loading}
                >
                  Previous
                </Button>
              )}
              
              <Button
                onClick={currentSectionData.save}
                disabled={loading}
                className="ml-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : currentSection === sections.length - 1 ? (
                  "Complete Listing"
                ) : (
                  "Save & Continue"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default CreateListing;
