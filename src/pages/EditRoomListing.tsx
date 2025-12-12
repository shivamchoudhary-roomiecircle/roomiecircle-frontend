import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { listingsApi } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, MapPin, Trash2, Archive, Power, PowerOff, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ListingFormData } from "@/components/listing-form/types";

// Sections
import { BasicDetailsSection } from "@/components/listing-form/BasicDetailsSection";
import { PricingSection } from "@/components/listing-form/PricingSection";
import { LocationSection } from "@/components/listing-form/LocationSection";
import { AmenitiesSection } from "@/components/listing-form/AmenitiesSection";
import { RoommatesSection } from "@/components/listing-form/RoommatesSection";
import { PreferencesSection } from "@/components/listing-form/PreferencesSection";
import { NeighborhoodSection } from "@/components/listing-form/NeighborhoodSection";
import { PhotosSection } from "@/components/listing-form/PhotosSection";

// Existing Components
import UploadPhotosContent from "@/components/listing/UploadPhotos";

export default function EditRoomListing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { toast } = useToast();


  const listingId = searchParams.get("id");
  const step = searchParams.get("step") || "details";
  const [listingStatus, setListingStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const [loading, setLoading] = useState(false);

  // Initial State matching ListingFormData
  const [formData, setFormData] = useState<ListingFormData>({
    description: "",
    roomType: "",
    bhkType: "",
    floor: 0,
    availableDate: "",
    propertyType: [],
    monthlyRent: 0,
    deposit: 0,
    maintenance: 0,
    maintenanceIncluded: false,
    addressText: "",
    placeId: "",
    amenities: [],
    roommates: [], // RoommateData[]
    minAge: "",
    maxAge: "",
    gender: "",
    profession: "",
    lifestyle: [],
    neighborhoodReview: "",
    neighborhoodRatings: { safety: 0, connectivity: 0, amenities: 0 },
    neighborhoodImages: [],
    images: [],
  });

  // Transform API response to Form Data
  const transformListingToFormData = (listing: any): ListingFormData => {
    // Helper to safely get mapped amenities
    // API might return a Map<String, Boolean> (object) or Array<String>
    // We need Array<String> for the form
    let mappedAmenities: string[] = [];
    if (Array.isArray(listing.amenities)) {
      mappedAmenities = listing.amenities;
    } else if (listing.amenities && typeof listing.amenities === 'object') {
      mappedAmenities = Object.keys(listing.amenities).filter(key => listing.amenities[key] === true);
    }

    const preferences = listing.roommatePreferences || listing.preferences || {};

    return {
      description: listing.description || "",
      roomType: listing.type?.toLowerCase() || listing.roomType?.toLowerCase() || "",
      bhkType: typeof listing.bhk === 'string' ? listing.bhk : (listing.bhk !== undefined ? listing.bhk.toString() : (listing.bhkType !== undefined ? listing.bhkType.toString() : "")),
      floor: listing.floor || 0,
      availableDate: listing.availableFrom ? new Date(listing.availableFrom).toISOString() : (listing.availableDate ? new Date(listing.availableDate).toISOString() : ""),

      // Property type can be array or string in different API versions/contexts
      propertyType: Array.isArray(listing.propertyType)
        ? listing.propertyType
        : (listing.propertyType ? [listing.propertyType] : (Array.isArray(listing.propertyTypes) ? listing.propertyTypes : [])),


      monthlyRent: listing.monthlyRent || 0,
      deposit: listing.deposit || 0,
      maintenance: listing.maintenance || 0,
      maintenanceIncluded: listing.maintenanceCovered || listing.maintenanceIncluded || false,

      addressText: listing.address || listing.addressText || "",
      placeId: listing.placeId || "",

      amenities: mappedAmenities,

      images: Array.isArray(listing.photos)
        ? listing.photos.map((img: any) => typeof img === 'string' ? { id: 0, url: img } : { id: img.id, url: img.url })
        : (Array.isArray(listing.images) ? listing.images.map((img: any) => typeof img === 'string' ? { id: 0, url: img } : { id: img.id, url: img.url }) : []),

      roommates: (listing.existingRoommates || listing.roommates || []).map((r: any) => ({
        name: r.name,
        gender: r.gender || "",
        age: r.age || 0,
        profession: r.profession || "",
        bio: r.bio || ""
      })),

      // Preferences
      minAge: preferences.minAge ? preferences.minAge.toString() : "",
      maxAge: preferences.maxAge ? preferences.maxAge.toString() : "",
      gender: preferences.gender || "",
      profession: preferences.profession || preferences.occupation || "",
      lifestyle: preferences.lifestyle || [],

      neighborhoodReview: listing.neighborhoodReview || "",
      neighborhoodRatings: {
        safety: listing.neighborhoodRatings?.safety || 0,
        connectivity: listing.neighborhoodRatings?.connectivity || 0,
        amenities: listing.neighborhoodRatings?.amenities || 0,
      },
      neighborhoodImages: Array.isArray(listing.neighborhoodImages)
        ? listing.neighborhoodImages.map((img: any) => typeof img === 'string' ? { id: 0, url: img } : { id: img.id, url: img.url })
        : [],
    };
  };

  useEffect(() => {
    const fetchListingData = async () => {
      if (!listingId) return;

      if (location.state?.listing) {
        const listing = location.state.listing;
        if (listing.status) setListingStatus(listing.status);
        // Note: location.state.listing might be DTO, might need simpler transform if it matches DTO
        // We'll reuse the generic transform but ensure it handles DTO shape
        // For now, let's assume we fetch fresh to be safe or map carefully
        setFormData(transformListingToFormData(listing));
        return;
      }

      try {
        setLoading(true);
        const response = await listingsApi.getRoomListingById(listingId);
        if (response.status) setListingStatus(response.status as any);
        setFormData(transformListingToFormData(response));
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to load listing data.",
          variant: "destructive",
        });
        navigate("/my-listings");
      } finally {
        setLoading(false);
      }
    };

    fetchListingData();
  }, [listingId, navigate, location.state, toast]);

  const updateListing = async (updates: any) => {
    if (!listingId) return;
    try {
      await listingsApi.updateRoom(listingId, updates);
      toast({ title: "Saved", description: "Changes saved successfully", duration: 1000 });
    } catch (error) {
      console.error("Failed to update listing:", error);
      toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
    }
  };

  const handleChange = (field: string, value: any) => {
    let parsedValue = value;
    // Number parsing logic
    if (["monthlyRent", "maintenance", "deposit", "floor", "minAge", "maxAge"].includes(field)) {
      parsedValue = value === "" ? "" : parseInt(value);
    }

    setFormData(prev => ({ ...prev, [field]: parsedValue }));

    // Prepare API updates
    // Map internal fields to API fields
    const updates: any = {};

    // Direct mapping for most
    if (field === "roomType") updates.type = parsedValue;
    else if (field === "bhkType") updates.bhk = parsedValue; // API expects String or Enum?
    else if (field === "availableDate") updates.availableFrom = parsedValue;
    else if (field === "maintenanceIncluded") updates.maintenanceCovered = parsedValue;
    else if (field === "addressText") updates.address = parsedValue;
    else if (field === "placeId") updates.placeId = parsedValue;
    else if (field === "amenities") updates.amenities = parsedValue;
    else if (["monthlyRent", "deposit", "maintenance", "floor", "description", "neighborhoodReview"].includes(field)) {
      updates[field] = parsedValue;
    }
    else if (field === "images" || field === "neighborhoodImages") {
      // Did we upload? Usually images component handles upload separately, this State is just for UI
      // But if we reorder, we might need to send updates? The section handles reorder API calls.
      return;
    }
    else if (field === "roommates") {
      updates.existingRoommates = parsedValue;
    }
    else if (field === "neighborhoodRatings") {
      updates.neighborhoodRatings = parsedValue;
    }
    else if (field === "propertyType") {
      updates.propertyType = parsedValue; // API expects array
    }

    // Preferences Handling
    if (["minAge", "maxAge", "gender", "profession", "lifestyle"].includes(field)) {
      const currentPrefs = {
        minAge: field === 'minAge' ? parsedValue : (formData.minAge ? parseInt(formData.minAge) : undefined),
        maxAge: field === 'maxAge' ? parsedValue : (formData.maxAge ? parseInt(formData.maxAge) : undefined),
        gender: field === 'gender' ? parsedValue : formData.gender,
        profession: field === 'profession' ? parsedValue : formData.profession,
        lifestyle: field === 'lifestyle' ? parsedValue : formData.lifestyle
      };
      updates.roommatePreferences = currentPrefs;
    }

    // Booleans (hasBalcony etc) -> removed from UI, handled via amenities only.

    if (Object.keys(updates).length > 0) {
      updateListing(updates);
    }
  };

  const handleStatusChange = async (newStatus: "ACTIVE" | "INACTIVE" | "ARCHIVED") => {
    if (!listingId) return;
    try {
      await listingsApi.updateRoomStatus(listingId, newStatus);
      setListingStatus(newStatus === "ARCHIVED" ? "INACTIVE" : newStatus); // UI treats Archived as Inactive or we might redirect? 
      // Actually checking api.types.ts, status is string. 
      // If archived, maybe we redirect to my-listings? 

      toast({
        title: "Status Updated",
        description: `Listing is now ${newStatus.toLowerCase()}.`
      });

      if (newStatus === "ARCHIVED") {
        navigate("/my-listings");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast({ title: "Error", description: "Failed to update listing status", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!listingId) return;
    try {
      await listingsApi.deleteRoom(listingId);
      toast({ title: "Deleted", description: "Listing deleted successfully" });
      navigate("/my-listings");
    } catch (error) {
      console.error("Failed to delete room:", error);
      toast({ title: "Error", description: "Failed to delete listing", variant: "destructive" });
    }
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
            {/* Header */}
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
                <h1 className="text-2xl font-bold">Your Room</h1>
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
              {/* Left Column */}
              <div className="space-y-8">
                <PhotosSection formData={formData} onChange={handleChange} listingId={listingId || ""} />

                <BasicDetailsSection formData={formData} onChange={handleChange} />

                <PricingSection formData={formData} onChange={handleChange} />

                <LocationSection formData={formData} onChange={handleChange} />

                <AmenitiesSection formData={formData} onChange={handleChange} />

                <RoommatesSection formData={formData} onChange={handleChange} />
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                <PreferencesSection formData={formData} onChange={handleChange} />

                <NeighborhoodSection formData={formData} onChange={handleChange} listingId={listingId || ""} />
              </div>
            </div>

            {/* Danger Zone / Actions */}
            <div className="mt-12 pt-8 border-t">
              <h2 className="text-xl font-semibold mb-6 text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Listing Actions
              </h2>

              <div className="flex flex-col md:flex-row gap-4 p-6 bg-secondary/20 rounded-lg border border-border">
                {/* Activate/Deactivate */}
                {listingStatus === "ACTIVE" ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="flex-1 gap-2 border-orange-500/50 hover:bg-orange-500/10 text-orange-600 hover:text-orange-700">
                        <PowerOff className="h-4 w-4" />
                        Deactivate Listing
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deactivate this listing?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will hide your listing from search results. You can reactivate it later at any time.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleStatusChange("INACTIVE")}>
                          Deactivate
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="flex-1 gap-2 border-green-500/50 hover:bg-green-500/10 text-green-600 hover:text-green-700">
                        <Power className="h-4 w-4" />
                        Activate Listing
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Activate this listing?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will make your listing visible to all users in search results.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleStatusChange("ACTIVE")}>
                          Activate
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {/* Archive - Only if not already archived (simplified: we don't have explicit archived check in UI state yet, assuming active/inactive cover main flows. If we want archive, it's usually a soft delete or 'hide forever but keep data') */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="flex-1 gap-2 border-muted-foreground/50 hover:bg-muted/50">
                      <Archive className="h-4 w-4" />
                      Archive Listing
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Archive this listing?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Archiving will move this listing to your archives. It won't be visible in search.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleStatusChange("ARCHIVED")}>
                        Archive
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <div className="w-px bg-border hidden md:block" />

                {/* Delete */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1 gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20 border shadow-none">
                      <Trash2 className="h-4 w-4" />
                      Delete Listing
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your listing and all associated data including photos and roommate references.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                        Delete Permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
    </div>
  );
}
