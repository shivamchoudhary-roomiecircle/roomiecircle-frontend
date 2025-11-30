import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/dashboard/ListingCard";
import { toast } from "@/hooks/use-toast";
import { Plus, FileX } from "lucide-react";

interface Listing {
  id: string;
  monthlyRent: number;
  address: string;
  hasBrokerage: boolean;
  photos: string[];
  lister: {
    id: number;
    name: string;
    profilePicture: string | null;
    verified: boolean;
    verificationLevel: string | null;
    profileScore: number | null;
  };
  roomType: string;
  bhkType: string;
  layoutType: string | null;
  layoutTypeKey: string | null;
  propertyTypes: string[];
  propertyTypeKeys: string[];
  // Additional fields that might be in the response
  listerId?: number;
  description?: string;
  latitude?: number;
  longitude?: number;
  addressText?: string;
  placeId?: string;
  maintenance?: number;
  maintenanceIncluded?: boolean;
  deposit?: number;
  availableDate?: string;
  listingType?: string;
  propertyType?: string[];
  hasBalcony?: boolean;
  hasPrivateWashroom?: boolean;
  hasFurniture?: boolean;
  washroomCount?: number;
  balconyCount?: number;
  bedroomCount?: number;
  amenities?: Record<string, any>;
  images?: string[];
  neighborhoodReview?: string;
  neighborhoodRatings?: Record<string, number>;
  neighborhoodImages?: string[];
  roommatePreferences?: {
    minAge: number;
    maxAge: number;
    gender: string;
    profession: string;
    renteeType: string;
    lifestyle: string[];
  };
  existingRoommates?: Array<{
    name: string;
    gender: string;
    age: number;
    profession: string;
    bio: string;
  }>;
  status?: string;
  completionScore?: number;
  missingSections?: Record<string, string[]>;
  publishedAt?: string;
  deactivatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

const MyListings = () => {
  const navigate = useNavigate();
  const [activeListings, setActiveListings] = useState<Listing[]>([]);
  const [inactiveListings, setInactiveListings] = useState<Listing[]>([]);
  const [selectedTab, setSelectedTab] = useState<"active" | "inactive">("active");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inactiveLoaded, setInactiveLoaded] = useState(false);

  const transformListing = (listing: any): Listing => {
    return {
      id: listing.id || "",
      monthlyRent: listing.monthlyRent || 0,
      address: listing.addressText || listing.address || "Address not provided",
      hasBrokerage: listing.hasBrokerage || false,
      photos: Array.isArray(listing.images)
        ? listing.images.map((img: any) => typeof img === 'string' ? img : img.url)
        : Array.isArray(listing.photos)
          ? listing.photos
          : [],
      lister: {
        id: (listing.lister && listing.lister.id) || 0,
        name: (listing.lister && listing.lister.name) || "Unknown Lister",
        profilePicture: (listing.lister && listing.lister.profilePicture) || null,
        verified: (listing.lister && listing.lister.verified) || false,
        verificationLevel: (listing.lister && listing.lister.verificationLevel) || null,
        profileScore: (listing.lister && listing.lister.profileScore) || null,
      },
      roomType: listing.roomType || "",
      bhkType: listing.bhkType || "",
      layoutType: listing.layoutType || null,
      layoutTypeKey: listing.layoutTypeKey || null,
      propertyTypes: Array.isArray(listing.propertyType)
        ? listing.propertyType
        : listing.propertyType
          ? [listing.propertyType]
          : listing.propertyTypes || listing.propertyTypeKeys || [],
      propertyTypeKeys: listing.propertyTypeKeys || [],
      // Include all other fields
      listerId: listing.listerId,
      description: listing.description,
      latitude: listing.latitude,
      longitude: listing.longitude,
      placeId: listing.placeId,
      maintenance: listing.maintenance,
      maintenanceIncluded: listing.maintenanceIncluded,
      deposit: listing.deposit,
      availableDate: listing.availableDate,
      listingType: listing.listingType,
      propertyType: Array.isArray(listing.propertyType)
        ? listing.propertyType
        : listing.propertyType
          ? [listing.propertyType]
          : [],
      hasBalcony: listing.hasBalcony,
      hasPrivateWashroom: listing.hasPrivateWashroom,
      hasFurniture: listing.hasFurniture,
      washroomCount: listing.washroomCount,
      balconyCount: listing.balconyCount,
      bedroomCount: listing.bedroomCount,
      amenities: listing.amenities || {},
      images: listing.images || [],
      neighborhoodReview: listing.neighborhoodReview,
      neighborhoodRatings: listing.neighborhoodRatings || {},
      neighborhoodImages: listing.neighborhoodImages || [],
      roommatePreferences: listing.roommatePreferences,
      existingRoommates: listing.existingRoommates || [],
      status: listing.status,
      completionScore: listing.completionScore,
      missingSections: listing.missingSections,
      publishedAt: listing.publishedAt,
      deactivatedAt: listing.deactivatedAt,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    };
  };

  const fetchListings = async (status: "ACTIVE" | "INACTIVE") => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getMyListings(status);
      console.log(`Fetched ${status} listings:`, data);

      const transformedListings = Array.isArray(data)
        ? data.map(transformListing)
        : [];

      // Sort by updatedAt in descending order (most recently updated first)
      const sortedListings = [...transformedListings].sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        // If dates are equal or both are 0, maintain original order
        if (dateA === dateB) return 0;
        // Descending order: most recent first
        return dateB - dateA;
      });

      if (status === "ACTIVE") {
        setActiveListings(sortedListings);
      } else {
        setInactiveListings(sortedListings);
        setInactiveLoaded(true);
      }
    } catch (err: any) {
      console.error(`Error fetching ${status} listings:`, err);
      setError(err.message || "Failed to load listings");
      toast({
        title: "Error",
        description: "Failed to load your listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch active listings on initial load
    fetchListings("ACTIVE");
  }, []);

  const handleTabChange = (tab: "active" | "inactive") => {
    setSelectedTab(tab);
    // Fetch inactive listings when switching to inactive tab (only once)
    if (tab === "inactive" && !inactiveLoaded) {
      fetchListings("INACTIVE");
    }
  };

  const handleDelete = async (listingId: string) => {
    try {
      await apiClient.deleteRoomListing(listingId);

      // Remove from UI and maintain sort order
      setActiveListings(prev => {
        const filtered = prev.filter(l => l.id !== listingId);
        return [...filtered].sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA;
        });
      });
      setInactiveListings(prev => {
        const filtered = prev.filter(l => l.id !== listingId);
        return [...filtered].sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA;
        });
      });

      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete listing",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (listingId: string, newStatus: string) => {
    try {
      await apiClient.updateListingStatus(listingId, newStatus);

      // Refetch both lists to ensure accurate data (they will be sorted automatically)
      const promises = [fetchListings("ACTIVE")];
      if (inactiveLoaded) {
        promises.push(fetchListings("INACTIVE"));
      }
      await Promise.all(promises);

      toast({
        title: "Success",
        description: `Listing ${newStatus === "ACTIVE" ? "activated" : "deactivated"} successfully`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update listing status",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (listingId: string) => {
    navigate(`/edit-listing?id=${listingId}`);
  };

  const currentListings = selectedTab === "active" ? activeListings : inactiveListings;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {selectedTab === "active" ? "Active listings" : "Deactivated listings"}
          </h1>

          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-b border-border">
            <button
              onClick={() => handleTabChange("active")}
              className={`pb-2 px-1 font-medium transition-colors ${selectedTab === "active"
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              ACTIVE {activeListings.length > 0 && `(${activeListings.length})`}
            </button>
            <button
              onClick={() => handleTabChange("inactive")}
              className={`pb-2 px-1 font-medium transition-colors ${selectedTab === "inactive"
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              INACTIVE {inactiveListings.length > 0 && `(${inactiveListings.length})`}
            </button>
          </div>
        </div>

        {/* New Listing Button */}
        <div className="mb-8 flex justify-end">
          <Button onClick={() => navigate("/create-listing")}>
            <Plus className="h-4 w-4 mr-2" />
            New listing
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchListings(selectedTab === "active" ? "ACTIVE" : "INACTIVE")}>Retry</Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && currentListings.length === 0 && (
          <div className="text-center py-12">
            <FileX className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">NO LISTINGS</h3>
            <Button onClick={() => navigate("/create-listing")} className="mt-6">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Listing
            </Button>
          </div>
        )}

        {/* Listings Grid */}
        {!isLoading && !error && currentListings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyListings;
