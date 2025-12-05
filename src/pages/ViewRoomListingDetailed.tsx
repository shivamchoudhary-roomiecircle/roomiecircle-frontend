import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { searchApi } from "@/lib/api";
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
import { useConfig } from "@/contexts/ConfigContext.tsx";
import { IconRenderer } from "@/lib/iconMapper.tsx";
import SEO from "@/components/SEO.tsx";

export default function ViewRoomListingDetailed() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { config } = useConfig();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      try {
        setLoading(true);
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

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={`${listing.addressText} - ${listing.monthlyRent}/mo`}
        description={listing.description || `Check out this room in ${listing.addressText} for ${listing.monthlyRent}.`}
        keywords={['room for rent', listing.addressText, 'shared apartment', 'roomiecircle']}
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
            <ListingDetails listing={listing} />

            {/* Listed By */}
            <ListedBy lister={listing.lister} />
          </div>


          {/* Sidebar Column */}
          <div className="space-y-3">
            {/* Map Card */}
            <ListingMap listing={listing} />

            {/* Amenities Card */}
            <ListingAmenities listing={listing} />

            {/* Current Roommates Card */}
            {listing.existingRoommates && listing.existingRoommates.length > 0 && (
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
                            {roommate.profession && config?.professions?.find((p: any) => p.value === roommate.profession)?.label
                              ? config.professions.find((p: any) => p.value === roommate.profession)?.label
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
            <ListingNeighborhood
              review={listing.neighborhoodReview}
              ratings={listing.neighborhoodRatings}
              images={listing.neighborhoodImages?.map((img: any) => typeof img === 'string' ? img : img.url)}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
