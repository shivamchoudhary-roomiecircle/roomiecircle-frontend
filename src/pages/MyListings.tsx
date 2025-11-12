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
  listerId: number;
  description: string;
  latitude: number;
  longitude: number;
  addressText: string;
  placeId: string;
  monthlyRent: number;
  maintenance: number;
  maintenanceIncluded: boolean;
  deposit: number;
  availableDate: string;
  listingType: string;
  propertyType: string[];
  layoutType: string;
  hasBalcony: boolean;
  hasPrivateWashroom: boolean;
  hasFurniture: boolean;
  washroomCount: number;
  balconyCount: number;
  bedroomCount: number;
  amenities: Record<string, any>;
  images: string[];
  neighborhoodReview: string;
  neighborhoodRatings: Record<string, number>;
  neighborhoodImages: string[];
  roommatePreferences: {
    minAge: number;
    maxAge: number;
    gender: string;
    profession: string;
    renteeType: string;
    lifestyle: string[];
  };
  existingRoommates: Array<{
    name: string;
    gender: string;
    age: number;
    profession: string;
    bio: string;
  }>;
  status: string;
  completionScore: number;
  missingSections: Record<string, string[]>;
  publishedAt: string;
  deactivatedAt: string;
  createdAt: string;
  updatedAt: string;
}

const MyListings = () => {
  const navigate = useNavigate();
  const [activeListings, setActiveListings] = useState<Listing[]>([]);
  const [inactiveListings, setInactiveListings] = useState<Listing[]>([]);
  const [selectedTab, setSelectedTab] = useState<"active" | "inactive">("active");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getMyListings();
      setActiveListings(data.active || []);
      setInactiveListings(data.inactive || []);
    } catch (err: any) {
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
    fetchListings();
  }, []);

  const handleDelete = async (listingId: string) => {
    try {
      await apiClient.deleteListing(listingId);
      
      // Remove from UI
      setActiveListings(prev => prev.filter(l => l.id !== listingId));
      setInactiveListings(prev => prev.filter(l => l.id !== listingId));
      
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
      
      // Move between lists
      if (newStatus === "ACTIVE") {
        const listing = inactiveListings.find(l => l.id === listingId);
        if (listing) {
          setInactiveListings(prev => prev.filter(l => l.id !== listingId));
          setActiveListings(prev => [...prev, { ...listing, status: "ACTIVE" }]);
        }
      } else {
        const listing = activeListings.find(l => l.id === listingId);
        if (listing) {
          setActiveListings(prev => prev.filter(l => l.id !== listingId));
          setInactiveListings(prev => [...prev, { ...listing, status: "INACTIVE" }]);
        }
      }
      
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
    // Find the listing from current lists
    const listing = [...activeListings, ...inactiveListings].find(l => l.id === listingId);
    
    // Pass listing data via navigation state to avoid refetching
    navigate(`/create-listing?id=${listingId}`, { 
      state: { listing } 
    });
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
              onClick={() => setSelectedTab("active")}
              className={`pb-2 px-1 font-medium transition-colors ${
                selectedTab === "active"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ACTIVE
            </button>
            <button
              onClick={() => setSelectedTab("inactive")}
              className={`pb-2 px-1 font-medium transition-colors ${
                selectedTab === "inactive"
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
            <Button onClick={fetchListings}>Retry</Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && currentListings.length === 0 && (
          <div className="text-center py-12">
            <FileX className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">NO LISTINGS</h3>
            <p className="text-muted-foreground mb-6">
              Create a new listing using the link above
            </p>
            <Button onClick={() => navigate("/create-listing")}>
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
