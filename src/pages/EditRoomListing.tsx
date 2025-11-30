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
import { Loader2, Home, DollarSign, MapPin, Bed, Users, Image as ImageIcon, Star, X, ArrowLeft, Plus } from "lucide-react";
import { LocationAutocomplete } from "@/components/search/LocationAutocomplete";
import { IconRenderer } from "@/lib/iconMapper";
import { convertFileToJpeg } from "@/lib/image-utils";
import UploadPhotosContent from "../components/listing/UploadPhotos";
import { PhotoUploadGrid } from "@/components/listing/PhotoUploadGrid";
import { SortablePhotoGrid } from "@/components/listing/SortablePhotoGrid";
interface RoommateData {
  name: string;
  gender: string;
  age: number;
  profession: string;
  bio: string;
}

const EditableField = ({
  label,
  value,
  onSave,
  type = "text",
  options = [],
  placeholder = "Click to edit",
  multiline = false,
  className = ""
}: {
  label: string;
  value: any;
  onSave: (val: any) => void;
  type?: "text" | "number" | "date" | "select";
  options?: { label: string; value: string; symbol?: string }[];
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2 mb-4 p-4 border rounded-lg bg-muted/20 animate-in fade-in zoom-in-95 duration-200">
        <Label>{label}</Label>
        {type === "select" ? (
          <Select value={tempValue} onValueChange={setTempValue}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center gap-2">
                    {opt.symbol && <IconRenderer symbol={opt.symbol} />}
                    <span>{opt.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : multiline ? (
          <Textarea
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            placeholder={placeholder}
            rows={4}
          />
        ) : (
          <Input
            type={type}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            placeholder={placeholder}
          />
        )}
        <div className="flex gap-2 justify-end mt-2">
          <Button size="sm" variant="ghost" onClick={handleCancel}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`py-4 border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors flex justify-between items-center group ${className}`}
      onClick={() => setIsEditing(true)}
    >
      <span className="text-muted-foreground font-medium">{label}</span>
      <div className="flex items-center gap-2 text-right">
        <span className="font-medium text-foreground max-w-[200px] truncate">
          {type === "select"
            ? options.find((o) => o.value === value)?.label || value || <span className="text-muted-foreground italic">Not set</span>
            : value || <span className="text-muted-foreground italic">Not set</span>}
        </span>
        <span className="opacity-0 group-hover:opacity-100 text-xs text-primary transition-opacity">Edit</span>
      </div>
    </div>
  );
};

export default function EditRoomListing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get("id");
  const { config, loading: configLoading } = useConfig();

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [listingStatus, setListingStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");


  const [step, setStep] = useState<'details' | 'photos'>('details');
  const [isLifestyleModalOpen, setIsLifestyleModalOpen] = useState(false);
  const [customLifestyle, setCustomLifestyle] = useState("");

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
    images: [] as { id: number; url: string; isUploading?: boolean }[],
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
    neighborhoodImages: [] as { id: number; url: string; isUploading?: boolean }[],
  });

  // Fetch listing data when editing
  useEffect(() => {
    const fetchListingData = async () => {
      if (!listingId) return;

      try {
        setLoading(true);
        const response = await apiClient.getRoomDetails(listingId);
        // Handle response structure - could be response.data or response directly
        const listing = response;

        if (listing.status) {
          setListingStatus(listing.status as "ACTIVE" | "INACTIVE");
        }

        // Transform and prefill form data
        setFormData({
          description: listing.description || "",
          monthlyRent: listing.monthlyRent ? listing.monthlyRent.toString() : "",
          maintenance: listing.maintenance ? listing.maintenance.toString() : "",
          maintenanceIncluded: listing.maintenanceIncluded || false,
          deposit: listing.deposit ? listing.deposit.toString() : "",
          availableDate: listing.availableDate || "",
          addressText: listing.addressText || "",
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
          images: Array.isArray(listing.images)
            ? listing.images.map((img: any) => typeof img === 'string' ? { id: 0, url: img } : { id: img.id, url: img.url })
            : [],
          minAge: listing.roommatePreferences?.minAge ? listing.roommatePreferences.minAge.toString() : "",
          maxAge: listing.roommatePreferences?.maxAge ? listing.roommatePreferences.maxAge.toString() : "",
          gender: listing.roommatePreferences?.gender || "",
          profession: listing.roommatePreferences?.profession || "",
          lifestyle: listing.roommatePreferences?.lifestyle || [],
          roommates: (listing.existingRoommates || []).map((r: any) => ({
            name: r.name,
            gender: r.gender || "",
            age: r.age || 0,
            profession: r.profession || "",
            bio: r.bio || ""
          })),
          neighborhoodReview: listing.neighborhoodReview || "",
          neighborhoodRatings: {
            safety: listing.neighborhoodRatings?.safety || 0,
            connectivity: listing.neighborhoodRatings?.connectivity || 0,
            amenities: listing.neighborhoodRatings?.amenities || 0,
          },
          neighborhoodImages: Array.isArray(listing.neighborhoodImages)
            ? listing.neighborhoodImages.map((img: any) => typeof img === 'string' ? { id: 0, url: img } : { id: img.id, url: img.url })
            : [],
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

  // Helper function to update listing
  const updateListing = async (updates: any) => {
    if (!listingId) return;

    try {
      await apiClient.updateRoom(listingId, updates);
      toast({
        title: "Saved",
        description: "Changes saved successfully",
        duration: 2000,
      });
    } catch (error: any) {
      console.error("Failed to update listing:", error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };



  const handleFieldChange = (field: string, value: any) => {
    let parsedValue = value;
    if (field === "monthlyRent" || field === "maintenance" || field === "deposit" ||
      field === "floor" || field === "minAge" || field === "maxAge") {
      parsedValue = value === "" ? "" : parseInt(value);
    }

    setFormData(prev => ({ ...prev, [field]: parsedValue }));
    updateListing({ [field]: parsedValue });
  };

  const handleNestedFieldChange = (parent: string, field: string, value: any) => {
    setFormData(prev => {
      const updatedParent = { ...(prev[parent as keyof typeof prev] as any), [field]: value };
      updateListing({ [parent]: updatedParent });
      return {
        ...prev,
        [parent]: updatedParent
      };
    });
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => {
      const newAmenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity];
      updateListing({ amenities: newAmenities });
      return { ...prev, amenities: newAmenities };
    });
  };

  const handlePropertyTypeToggle = (propertyType: string) => {
    setFormData(prev => {
      const newPropertyTypes = prev.propertyType.includes(propertyType)
        ? prev.propertyType.filter(p => p !== propertyType)
        : [...prev.propertyType, propertyType];
      updateListing({ propertyType: newPropertyTypes });
      return { ...prev, propertyType: newPropertyTypes };
    });
  };

  const handleLifestyleToggle = (lifestyle: string) => {
    setFormData(prev => {
      const newLifestyle = prev.lifestyle.includes(lifestyle)
        ? prev.lifestyle.filter(l => l !== lifestyle)
        : [...prev.lifestyle, lifestyle];
      updateListing({ lifestyle: newLifestyle });
      return { ...prev, lifestyle: newLifestyle };
    });
  };

  const handleAddCustomLifestyle = () => {
    if (!customLifestyle.trim()) return;
    const val = customLifestyle.trim();
    if (!formData.lifestyle.includes(val)) {
      handleLifestyleToggle(val);
      setCustomLifestyle("");
      toast({ title: "Added", description: `${val} added to your preferences.` });
    } else {
      toast({ title: "Already added", description: "This preference is already selected." });
    }
  };

  const handleAddRoommate = () => {
    setFormData(prev => {
      const newRoommates = [...prev.roommates, { name: "", gender: "", age: 0, profession: "", bio: "" }];
      updateListing({ roommates: newRoommates });
      return { ...prev, roommates: newRoommates };
    });
  };

  const handleRoommateChange = (index: number, field: keyof RoommateData, value: any) => {
    setFormData(prev => {
      const newRoommates = prev.roommates.map((r, i) => i === index ? { ...r, [field]: value } : r);
      return { ...prev, roommates: newRoommates };
    });
  };

  // Special handler for roommate inputs to save on blur
  const handleRoommateBlur = (index: number) => {
    updateListing({ roommates: formData.roommates });
  };

  const handleRemoveRoommate = (index: number) => {
    setFormData(prev => {
      const newRoommates = prev.roommates.filter((_, i) => i !== index);
      updateListing({ roommates: newRoommates });
      return { ...prev, roommates: newRoommates };
    });
  };

  const handleLocationChange = (value: string, placeId?: string) => {
    setFormData(prev => {
      const updates = {
        addressText: value,
        placeId: placeId || "",
      };
      // Only save if we have a placeId or it's cleared
      if (placeId || value === "") {
        updateListing(updates);
      }
      return { ...prev, ...updates };
    });
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }


  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {step === 'details' ? (
          <>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/my-listings?tab=${listingStatus === "INACTIVE" ? "inactive" : "active"}`)}
                  className="rounded-full hover:bg-muted -ml-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl">Your Room</h1>
              </div>

              {formData.addressText && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full text-primary animate-in fade-in slide-in-from-right-4 duration-500">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium truncate max-w-[200px] md:max-w-[300px]">
                    {formData.addressText}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Details, Pricing, Location, Amenities, Preferences, Roommates */}
              <div className="space-y-8">
                {/* Basic Details Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Room Photos</h2>
                    <span className="text-sm text-muted-foreground">{formData.images.length}/8</span>
                  </div>

                  <PhotoUploadGrid
                    listingId={listingId || ""}
                    flow="listing"
                    images={formData.images}
                    onImagesChange={(newImages) => {
                      setFormData(prev => ({ ...prev, images: newImages }));
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4">Details</h2>
                  <div className="bg-card rounded-lg border shadow-sm px-4">
                    <EditableField
                      label="Description"
                      value={formData.description}
                      onSave={(val) => handleFieldChange("description", val)}
                      multiline
                    />
                    <EditableField
                      label="Room Type"
                      value={formData.roomType}
                      onSave={(val) => handleFieldChange("roomType", val)}
                      type="select"
                      options={config?.roomTypes || []}
                    />
                    <EditableField
                      label="BHK Type"
                      value={formData.bhkType}
                      onSave={(val) => handleFieldChange("bhkType", val)}
                      type="select"
                      options={config?.bhkTypes || []}
                    />
                    <EditableField
                      label="Floor"
                      value={formData.floor}
                      onSave={(val) => handleFieldChange("floor", val)}
                      type="number"
                    />
                    <EditableField
                      label="Available From"
                      value={formData.availableDate}
                      onSave={(val) => handleFieldChange("availableDate", val)}
                      type="date"
                    />

                    {/* Property Types - Custom handling for multi-select/checkboxes */}
                    <div className="py-4 border-b border-border/50">
                      <span className="text-muted-foreground font-medium block mb-2">Property Type</span>
                      <div className="flex flex-wrap gap-2">
                        {config?.propertyTypes?.map(type => (
                          <div
                            key={type.value}
                            className={`px-3 py-1.5 rounded-full text-sm border cursor-pointer transition-colors ${formData.propertyType.includes(type.value)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-muted"
                              }`}
                            onClick={() => handlePropertyTypeToggle(type.value)}
                          >
                            <div className="flex items-center gap-1.5">
                              <IconRenderer symbol={type.symbol} />
                              <span>{type.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Boolean Toggles */}
                    <div className="py-4 flex flex-wrap gap-4">
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer ${formData.hasBalcony ? "bg-primary text-primary-foreground" : "bg-background"}`}
                        onClick={() => {
                          const newVal = !formData.hasBalcony;
                          handleFieldChange("hasBalcony", newVal);
                        }}
                      >
                        <span>Has Balcony</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer ${formData.hasPrivateWashroom ? "bg-primary text-primary-foreground" : "bg-background"}`}
                        onClick={() => {
                          const newVal = !formData.hasPrivateWashroom;
                          handleFieldChange("hasPrivateWashroom", newVal);
                        }}
                      >
                        <span>Private Washroom</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer ${formData.hasFurniture ? "bg-primary text-primary-foreground" : "bg-background"}`}
                        onClick={() => {
                          const newVal = !formData.hasFurniture;
                          handleFieldChange("hasFurniture", newVal);
                        }}
                      >
                        <span>Furnished</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Section */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Pricing</h2>
                  <div className="bg-card rounded-lg border shadow-sm px-4">
                    <EditableField
                      label="Monthly Rent (₹)"
                      value={formData.monthlyRent}
                      onSave={(val) => handleFieldChange("monthlyRent", val)}
                      type="number"
                    />
                    <EditableField
                      label="Security Deposit (₹)"
                      value={formData.deposit}
                      onSave={(val) => handleFieldChange("deposit", val)}
                      type="number"
                    />
                    <EditableField
                      label="Maintenance (₹)"
                      value={formData.maintenance}
                      onSave={(val) => handleFieldChange("maintenance", val)}
                      type="number"
                    />

                    <div className="py-4 flex items-center justify-between">
                      <span className="text-muted-foreground font-medium">Maintenance Included</span>
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer ${formData.maintenanceIncluded ? "bg-primary text-primary-foreground" : "bg-background"}`}
                        onClick={() => {
                          const newVal = !formData.maintenanceIncluded;
                          handleFieldChange("maintenanceIncluded", newVal);
                        }}
                      >
                        <span>{formData.maintenanceIncluded ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Section */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Location</h2>
                  <div className="bg-card rounded-lg border shadow-sm px-4 py-4">
                    <Label className="text-muted-foreground font-medium mb-2 block">Address</Label>
                    {formData.addressText ? (
                      <div className="group relative">
                        <p className="text-foreground font-medium pr-8">{formData.addressText}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setFormData(prev => ({ ...prev, addressText: "" }))} // Clear to edit
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <LocationAutocomplete
                        value={formData.addressText}
                        onChange={handleLocationChange}
                        placeholder="Search for your address..."
                      />
                    )}
                    {/* Fallback if address is cleared, show autocomplete */}
                    {formData.addressText === "" && (
                      <div className="mt-2">
                        <LocationAutocomplete
                          value={formData.addressText}
                          onChange={handleLocationChange}
                          placeholder="Search for your address..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Amenities Section */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                  <div className="bg-card rounded-lg border shadow-sm px-4 py-4">
                    {config?.amenities && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3">In Home</h3>
                          <div className="flex flex-wrap gap-2">
                            {config.amenities.in_home.map(amenity => (
                              <div
                                key={amenity.value}
                                className={`px-3 py-1.5 rounded-full text-sm border cursor-pointer transition-colors flex items-center gap-2 ${formData.amenities.includes(amenity.value)
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background hover:bg-muted"
                                  }`}
                                onClick={() => handleAmenityToggle(amenity.value)}
                              >
                                <IconRenderer symbol={amenity.symbol} />
                                <span>{amenity.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3">On Property</h3>
                          <div className="flex flex-wrap gap-2">
                            {config.amenities.on_property.map(amenity => (
                              <div
                                key={amenity.value}
                                className={`px-3 py-1.5 rounded-full text-sm border cursor-pointer transition-colors flex items-center gap-2 ${formData.amenities.includes(amenity.value)
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background hover:bg-muted"
                                  }`}
                                onClick={() => handleAmenityToggle(amenity.value)}
                              >
                                <IconRenderer symbol={amenity.symbol} />
                                <span>{amenity.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-3">Safety</h3>
                          <div className="flex flex-wrap gap-2">
                            {config.amenities.safety.map(amenity => (
                              <div
                                key={amenity.value}
                                className={`px-3 py-1.5 rounded-full text-sm border cursor-pointer transition-colors flex items-center gap-2 ${formData.amenities.includes(amenity.value)
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background hover:bg-muted"
                                  }`}
                                onClick={() => handleAmenityToggle(amenity.value)}
                              >
                                <IconRenderer symbol={amenity.symbol} />
                                <span>{amenity.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>


                {/* Existing Roommates Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Roommates</h2>
                    <Button variant="outline" size="sm" onClick={handleAddRoommate}>
                      Add Roommate
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {formData.roommates.map((roommate, index) => (
                      <div key={index} className="bg-card rounded-lg border shadow-sm p-4 relative group">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          onClick={() => handleRemoveRoommate(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Name</Label>
                            <Input
                              value={roommate.name}
                              onChange={(e) => handleRoommateChange(index, "name", e.target.value)}
                              onBlur={() => handleRoommateBlur(index)}
                              className="mt-1"
                              placeholder="Name"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Gender</Label>
                            <Select
                              value={roommate.gender}
                              onValueChange={(v) => {
                                handleRoommateChange(index, "gender", v);
                                const newRoommates = formData.roommates.map((r, i) => i === index ? { ...r, gender: v } : r);
                                updateListing({ roommates: newRoommates });
                              }}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent>
                                {config?.genders?.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Age</Label>
                            <Input
                              type="number"
                              value={roommate.age || ""}
                              onChange={(e) => handleRoommateChange(index, "age", parseInt(e.target.value))}
                              onBlur={() => handleRoommateBlur(index)}
                              className="mt-1"
                              placeholder="Age"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Profession</Label>
                            <Select
                              value={roommate.profession}
                              onValueChange={(v) => {
                                handleRoommateChange(index, "profession", v);
                                const newRoommates = formData.roommates.map((r, i) => i === index ? { ...r, profession: v } : r);
                                updateListing({ roommates: newRoommates });
                              }}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select profession" />
                              </SelectTrigger>
                              <SelectContent>
                                {config?.professions?.map(prof => (
                                  <SelectItem key={prof.value} value={prof.value}>
                                    {prof.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Bio</Label>
                          <Textarea
                            value={roommate.bio}
                            onChange={(e) => handleRoommateChange(index, "bio", e.target.value)}
                            onBlur={() => handleRoommateBlur(index)}
                            className="mt-1"
                            placeholder="Tell us about this roommate..."
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                    {formData.roommates.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                        No roommates added yet
                      </div>
                    )}
                  </div>
                </div>
              </div>


              {/* Right Column: Photos, Neighborhood */}
              <div className="space-y-8">
                {/* Photos Section */}

                {/* Roommate Preferences Section */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Roommate Preferences</h2>
                  <div className="bg-card rounded-lg border shadow-sm px-4">
                    <EditableField
                      label="Min Age"
                      value={formData.minAge}
                      onSave={(val) => handleFieldChange("minAge", val)}
                      type="number"
                    />
                    <EditableField
                      label="Max Age"
                      value={formData.maxAge}
                      onSave={(val) => handleFieldChange("maxAge", val)}
                      type="number"
                    />
                    <EditableField
                      label="Preferred Gender"
                      value={formData.gender}
                      onSave={(val) => handleFieldChange("gender", val)}
                      type="select"
                      options={config?.genders || []}
                    />
                    <EditableField
                      label="Preferred Profession"
                      value={formData.profession}
                      onSave={(val) => handleFieldChange("profession", val)}
                      type="select"
                      options={config?.professions || []}
                    />

                    <div className="py-4 border-b border-border/50">
                      <span className="text-muted-foreground font-medium block mb-2">Lifestyle Preferences</span>
                      <div className="flex flex-wrap gap-2">
                        {formData.lifestyle.map(value => {
                          const configItem = config?.lifestylePreferences?.find(i => i.value === value);
                          return (
                            <div
                              key={value}
                              className="px-3 py-1.5 rounded-full text-sm border bg-primary text-primary-foreground border-primary flex items-center gap-2"
                            >
                              {configItem ? <IconRenderer symbol={configItem.symbol} /> : null}
                              <span>{configItem ? configItem.label : value}</span>
                            </div>
                          );
                        })}
                        <button
                          onClick={() => setIsLifestyleModalOpen(true)}
                          className="px-3 py-1.5 rounded-full text-sm border border-dashed border-muted-foreground/50 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-1 text-muted-foreground"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>



                {/* Neighborhood Photos Section */}
                {/* Neighborhood Details Section */}
                <div>
                  <h2 className="text-sm uppercase tracking-widest text-muted-foreground/80 font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent w-fit">Neighborhood Details</h2>
                  <div className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-md shadow-lg p-6 hover:bg-white/10 transition-colors duration-300">
                    <EditableField
                      label="Neighborhood Review"
                      value={formData.neighborhoodReview}
                      onSave={(val) => handleFieldChange("neighborhoodReview", val)}
                      multiline
                    />

                    <div className="py-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Safety Rating</Label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleNestedFieldChange("neighborhoodRatings", "safety", star)}
                              className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                            >
                              <Star
                                className={`h-6 w-6 transition-colors ${star <= formData.neighborhoodRatings.safety
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-none text-muted-foreground"
                                  }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Connectivity Rating</Label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleNestedFieldChange("neighborhoodRatings", "connectivity", star)}
                              className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                            >
                              <Star
                                className={`h-6 w-6 transition-colors ${star <= formData.neighborhoodRatings.connectivity
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-none text-muted-foreground"
                                  }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Amenities Rating</Label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleNestedFieldChange("neighborhoodRatings", "amenities", star)}
                              className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                            >
                              <Star
                                className={`h-6 w-6 transition-colors ${star <= formData.neighborhoodRatings.amenities
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-none text-muted-foreground"
                                  }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Neighborhood Photos</h2>
                    <span className="text-sm text-muted-foreground">{formData.neighborhoodImages.length}/8</span>
                  </div>

                  <SortablePhotoGrid
                    images={formData.neighborhoodImages}
                    onImagesChange={async (newImages) => {
                      setFormData(prev => ({ ...prev, neighborhoodImages: newImages }));
                      // Call reorder API
                      if (listingId) {
                        try {
                          await apiClient.reorderMedia(
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
                    }}
                    onUpload={async (e) => {
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

                      // Create local preview URLs immediately
                      const fileArray = Array.from(files);
                      const previewItems = fileArray.map(file => ({ id: 0, url: URL.createObjectURL(file), isUploading: true }));
                      const startIndex = formData.neighborhoodImages.length;

                      // Add preview URLs immediately for instant feedback
                      setFormData(prev => ({
                        ...prev,
                        neighborhoodImages: [...prev.neighborhoodImages, ...previewItems]
                      }));

                      setUploadingImages(true);
                      try {
                        const uploadPromises = fileArray.map(async (file: File, index) => {
                          // Validate file type
                          const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                          if (!validTypes.includes(file.type)) {
                            throw new Error(`Invalid file type: ${file.type}. Please upload JPEG, PNG, or WebP images.`);
                          }

                          // Step 1: Request upload URL
                          const { uploadId, presigned_url } = await apiClient.requestMediaUploadUrl(
                            listingId,
                            "NEIGHBORHOOD",
                            "IMAGE",
                            file.type,
                          );

                          // Step 2: Upload to GCS
                          const uploadResponse = await fetch(presigned_url, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': file.type,
                            },
                            body: file,
                          });

                          if (!uploadResponse.ok) {
                            throw new Error(`Failed to upload ${file.name}`);
                          }

                          // Step 3: Confirm upload
                          const confirmResponse = await apiClient.confirmMediaUpload(uploadId);

                          return {
                            index: startIndex + index,
                            mediaId: confirmResponse.id,
                            url: confirmResponse.url || confirmResponse.fullUrl || presigned_url
                          };
                        });

                        const results = await Promise.all(uploadPromises);

                        // Replace preview URLs with actual URLs
                        setFormData(prev => {
                          const newImages = [...prev.neighborhoodImages];
                          results.forEach(({ index, mediaId, url }) => {
                            URL.revokeObjectURL(newImages[index].url);
                            newImages[index] = { id: mediaId, url: url, isUploading: false };
                          });

                          return {
                            ...prev,
                            neighborhoodImages: newImages
                          };
                        });


                        toast({
                          title: "Success",
                          description: `${results.length} photo(s) uploaded successfully`,
                        });
                      } catch (error: any) {
                        // Check for media limit error
                        if (error?.message?.includes("Media limit exceeded")) {
                          toast({
                            title: "Upload limit reached",
                            description: "Maximum 8 photos per neighborhood listing",
                            variant: "destructive",
                          });
                        } else {
                          toast({
                            title: "Error",
                            description: error?.message || "Failed to upload photos. Please try again.",
                            variant: "destructive",
                          });
                        }

                        // Remove failed previews
                        setFormData(prev => {
                          const newImages = prev.neighborhoodImages.slice(0, startIndex);
                          previewItems.forEach(item => URL.revokeObjectURL(item.url));
                          return {
                            ...prev,
                            neighborhoodImages: newImages
                          };
                        });

                      } finally {
                        setUploadingImages(false);
                        e.target.value = '';
                      }
                    }}
                    uploadId="neighborhood-photo-upload"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <UploadPhotosContent
            listingId={listingId!}
            onFinish={() => navigate(`/my-listings?tab=${listingStatus === "INACTIVE" ? "inactive" : "active"}`)}
          />
        )}
      </div>
      <Footer />

      {/* Lifestyle Preferences Modal */}
      {isLifestyleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border/50 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h3 className="text-xl font-semibold">Lifestyle Preferences</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsLifestyleModalOpen(false)} className="rounded-full hover:bg-muted">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {/* Custom Tag Input */}
              <div className="mb-8">
                <Label className="text-sm font-medium text-muted-foreground mb-3 block">Add Custom Preference</Label>
                <div className="flex gap-3">
                  <Input
                    value={customLifestyle}
                    onChange={(e) => setCustomLifestyle(e.target.value)}
                    placeholder="e.g. Early Riser, Yoga Lover..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomLifestyle()}
                  />
                  <Button onClick={handleAddCustomLifestyle}>Add</Button>
                </div>
              </div>

              {/* Predefined Tags */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-3 block">Popular Tags</Label>
                <div className="flex flex-wrap gap-3">
                  {config?.lifestylePreferences?.map(lifestyle => {
                    const isSelected = formData.lifestyle.includes(lifestyle.value);
                    return (
                      <div
                        key={lifestyle.value}
                        className={`px-4 py-2 rounded-full text-sm border cursor-pointer transition-all duration-200 flex items-center gap-2 ${isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-md transform scale-105"
                          : "bg-background hover:bg-muted hover:border-primary/50"
                          }`}
                        onClick={() => handleLifestyleToggle(lifestyle.value)}
                      >
                        <IconRenderer symbol={lifestyle.symbol} />
                        <span>{lifestyle.label}</span>
                        {isSelected && <X className="w-3 h-3 ml-1 opacity-70" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Custom Tags (that are not in config) */}
              {formData.lifestyle.some(l => !config?.lifestylePreferences?.find(c => c.value === l)) && (
                <div className="mt-8">
                  <Label className="text-sm font-medium text-muted-foreground mb-3 block">Your Custom Tags</Label>
                  <div className="flex flex-wrap gap-3">
                    {formData.lifestyle.filter(l => !config?.lifestylePreferences?.find(c => c.value === l)).map(tag => (
                      <div
                        key={tag}
                        className="px-4 py-2 rounded-full text-sm border bg-primary text-primary-foreground border-primary shadow-md flex items-center gap-2 cursor-pointer hover:bg-destructive hover:border-destructive transition-colors"
                        onClick={() => handleLifestyleToggle(tag)}
                      >
                        <span>{tag}</span>
                        <X className="w-3 h-3 ml-1 opacity-70" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/50 bg-muted/20 rounded-b-2xl flex justify-end">
              <Button onClick={() => setIsLifestyleModalOpen(false)}>Done</Button>
            </div>
          </div>
        </div>
      )}
    </div >
  );

}
