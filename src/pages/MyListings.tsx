import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MyListingCard } from "@/components/MyListingCard";
import { toast } from "@/hooks/use-toast";
import { Plus, FileX } from "lucide-react";
import { RoomListingDTO, MediaDto } from "@/types/api.types";

const MyListings = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "inactive" ? "inactive" : "active";

  const [activeListings, setActiveListings] = useState<RoomListingDTO[]>([]);
  const [inactiveListings, setInactiveListings] = useState<RoomListingDTO[]>([]);
  const [selectedTab, setSelectedTab] = useState<"active" | "inactive">(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inactiveLoaded, setInactiveLoaded] = useState(false);

  const transformListing = (listing: any): RoomListingDTO => {
    return {
      id: listing.id || 0,
      listerId: listing.listerId || 0,
      monthlyRent: listing.monthlyRent,
      addressText: listing.addressText || listing.address,
      images: Array.isArray(listing.images)
        ? listing.images.map((img: any) =>
          typeof img === 'string' ? { url: img, tag: 'ROOM_PHOTO' as const, mediaType: 'IMAGE' as const, status: 'ACTIVE' as const, id: 0, createdAt: '' } : img
        )
        : [],
      lister: listing.lister,
      roomType: listing.roomType,
      bhkType: listing.bhkType,
      propertyType: Array.isArray(listing.propertyType)
        ? listing.propertyType
        : listing.propertyType
          ? [listing.propertyType]
          : listing.propertyTypes || [],
      description: listing.description,
      latitude: listing.latitude,
      longitude: listing.longitude,
      placeId: listing.placeId,
      maintenance: listing.maintenance,
      maintenanceIncluded: listing.maintenanceIncluded,
      deposit: listing.deposit,
      availableDate: listing.availableDate,
      hasBalcony: listing.hasBalcony,
      hasPrivateWashroom: listing.hasPrivateWashroom,
      hasFurniture: listing.hasFurniture,
      floor: listing.floor,
      amenities: listing.amenities,
      neighborhoodReview: listing.neighborhoodReview,
      neighborhoodRatings: listing.neighborhoodRatings,
      neighborhoodImages: listing.neighborhoodImages,
      roommatePreferences: listing.roommatePreferences,
      existingRoommates: listing.existingRoommates,
      status: listing.status,
      completionScore: listing.completionScore,
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
      const data = await apiClient.getMyRooms(status);
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

    // If initial tab is inactive, fetch inactive listings too
    if (initialTab === "inactive") {
      fetchListings("INACTIVE");
    }
  }, []);

  // Update selectedTab when URL param changes
  useEffect(() => {
    const currentTab = searchParams.get("tab") === "inactive" ? "inactive" : "active";
    setSelectedTab(currentTab);

    if (currentTab === "inactive" && !inactiveLoaded) {
      fetchListings("INACTIVE");
    }
  }, [searchParams, inactiveLoaded]);

  const handleTabChange = (tab: "active" | "inactive") => {
    setSelectedTab(tab);
    setSearchParams({ tab });

    // Fetch inactive listings when switching to inactive tab (only once)
    if (tab === "inactive" && !inactiveLoaded) {
      fetchListings("INACTIVE");
    }
  };

  const handleDelete = async (listingId: number) => {
    try {
      await apiClient.deleteRoom(listingId.toString());

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

  const handleStatusChange = async (listingId: number, newStatus: string) => {
    try {
      await apiClient.updateRoomStatus(listingId.toString(), newStatus);

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

  const handleEdit = (listingId: number) => {
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
              <MyListingCard
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
