import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { searchApi } from "@/lib/api";
import { chatApi } from "@/lib/api/chat";
import { wishlistApi } from "@/lib/api/wishlist";
import Navbar from "@/components/Navbar.tsx";
import Footer from "@/components/Footer.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { toast } from "sonner";
import { ListingPhotos } from "@/components/listing/ListingPhotos.tsx";
import { ListingDetails } from "@/components/listing/ListingDetails.tsx";
import { ListingMap } from "@/components/listing/ListingMap.tsx";
import { ListingAmenities } from "@/components/listing/ListingAmenities.tsx";
import { ListingNeighborhood } from "@/components/listing/ListingNeighborhood.tsx";
import { ListedBy } from "@/components/listing/ListedBy.tsx";
import { User } from "lucide-react";
import { IconRenderer } from "@/lib/iconMapper.tsx";
import { PROFESSION_UI } from "@/constants/ui-constants";
import { Profession } from "../types/api.types";
import SEO from "@/components/SEO.tsx";
import { useAuth } from "@/contexts/AuthContext";
import { InboxItem } from "@/types/chat";

export default function ViewRoomListingDetailed() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [listing, setListing] = useState<any>(() => {
    // Initial state from navigation if available (reuse photo)
    if (location.state && location.state.previewImage) {
      return {
        id: id,
        photos: [{ url: location.state.previewImage }],
        // Add skeleton/loading indicators for other fields if needed or handle comfortably in UI
        isLoadingPreview: true
      };
    }
    return null;
  });
  const [loading, setLoading] = useState(!listing); // If we have listing (preview), we are not fully "loading" in the sense of empty screen, but we are fetching.
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      try {
        // If we don't have a preview, show full loading state
        if (!listing?.isLoadingPreview) {
          setLoading(true);
        }

        const response = await searchApi.getRoomDetailsForSearch(id);
        setListing(response);
      } catch (error) {
        console.error("Error fetching listing:", error);
        toast.error("Failed to load listing details");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();

  }, [id, navigate]);

  // Check wishlist status
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!isAuthenticated || !id) {
        setIsWishlisted(false);
        return;
      }

      try {
        // Fetch users wishlist to check if this room is in it
        // Optimisation: ideally backend would return "isWishlisted" field in getRoomDetails
        // or we have a specific endpoint to check status.
        // For now, fetching recent wishlist items.
        const response = await wishlistApi.getWishlist({ page: 0, size: 100 });
        if (response.success && response.data) {
          const found = response.data.content.some((item: any) => item.id.toString() === id);
          setIsWishlisted(found);
        }
      } catch (error) {
        console.error("Failed to check wishlist status", error);
      }
    };

    checkWishlistStatus();
  }, [id, isAuthenticated]);

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to manage your wishlist");
      return;
    }

    if (!listing || !listing.id) return;

    // Optimistic update
    const previousState = isWishlisted;
    setIsWishlisted(!previousState);

    try {
      if (previousState) {
        // Remove
        await wishlistApi.removeFromWishlist(listing.id);
        toast.success("Removed from wishlist");
      } else {
        // Add
        await wishlistApi.addToWishlist(listing.id);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      // Revert
      setIsWishlisted(previousState);
      toast.error("Failed to update wishlist");
      console.error("Wishlist toggle error:", error);
    }
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to start a chat");
      // navigate("/login"); // or open login modal
      return;
    }

    if (!listing || !listing.lister) return;

    try {
      const threadData = await chatApi.createThread({
        targetUserId: listing.lister.id,
        resourceType: "ROOM_LISTING",
        resourceId: listing.id
      });

      if (threadData && threadData.id) {
        // Construct a temporary InboxItem or use the response to format it
        const newThread: InboxItem = {
          threadId: threadData.id,
          resourceType: threadData.resourceType,
          resourceId: threadData.resourceId,
          lastMessageAt: threadData.lastMessageAt,
          lastMessagePreview: "Start of conversation",
          unreadCount: 0
        };

        navigate("/messages", { state: { thread: newThread } });
      } else {
        toast.error("Failed to create chat thread");
      }

    } catch (error) {
      console.error("Error creating thread:", error);
      toast.error("Failed to start chat. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-6">
          <div className="space-y-6 max-w-6xl mx-auto">
            <Skeleton className="h-[280px] w-full rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-3">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-[150px] w-full" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) return null;

  const isLoadingPreview = listing.isLoadingPreview;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={isLoadingPreview ? "Loading..." : `${listing.addressText} - ${listing.monthlyRent}/mo`}
        description={isLoadingPreview ? "Loading room details..." : (listing.description || `Check out this room in ${listing.addressText} for ${listing.monthlyRent}.`)}
        keywords={['room for rent', isLoadingPreview ? '' : listing.addressText, 'shared apartment', 'roomiecircle']}
      />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Photos */}
            <ListingPhotos
              images={listing.photos?.map((p: any) => p.url) || (Array.isArray(listing.images) ? listing.images.map((img: any) => typeof img === 'string' ? img : img.url) : [])}
              description={listing.description}
            />

            {/* Details */}
            {isLoadingPreview ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
              <ListingDetails
                listing={listing}
                isWishlisted={isWishlisted}
                onToggleWishlist={handleToggleWishlist}
              />
            )}

            {/* Listed By */}
            {isLoadingPreview ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <ListedBy
                lister={listing.lister}
                onStartChat={handleStartChat}
                isOwnListing={user?.id === listing.lister?.id}
              />
            )}
          </div>


          {/* Sidebar Column */}
          <div className="space-y-3">
            {/* Map Card */}
            {isLoadingPreview ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <ListingMap listing={listing} />
            )}

            {/* Amenities Card */}
            {isLoadingPreview ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <ListingAmenities listing={listing} />
            )}

            {/* Current Roommates Card */}
            {!isLoadingPreview && listing.existingRoommates && listing.existingRoommates.length > 0 && (
              <Card className="border border-border/50 shadow-md bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">Current Roommates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {listing.existingRoommates.map((roommate: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{roommate.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {roommate.age}{' '}
                            {roommate.profession && PROFESSION_UI[roommate.profession as Profession]?.label
                              ? PROFESSION_UI[roommate.profession as Profession]?.label
                              : roommate.profession
                            }
                          </p>
                          {roommate.bio && (
                            <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">
                              "{roommate.bio}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Neighborhood */}
            {isLoadingPreview ? (
              <Skeleton className="h-[150px] w-full" />
            ) : (
              <ListingNeighborhood
                review={listing.neighborhoodReview}
                ratings={listing.neighborhoodRatings}
                images={listing.neighborhoodImages?.map((img: any) => typeof img === 'string' ? img : img.url)}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
