import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/contexts/ConfigContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, IndianRupee, Clock, ArrowUpDown, Map as MapIcon, Grid3x3, Plus, Minus, ArrowLeft, List, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GoogleMap } from "./GoogleMap";
import { apiClient } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useDebounce } from "@/hooks/useDebounce";
import { PremiumSlider } from "@/components/ui/PremiumSlider";

export const RoomsResults = () => {
  const navigate = useNavigate();
  const { config } = useConfig();
  const [location, setLocation] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [priceType, setPriceType] = useState("monthly");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [radius, setRadius] = useState(10);

  // More filters state
  const [gender, setGender] = useState("");
  const [verifications, setVerifications] = useState<string[]>([]);
  const [layout, setLayout] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [duration, setDuration] = useState("");
  const [roomType, setRoomType] = useState("");
  const [mapBounds, setMapBounds] = useState<{ minLat: number; maxLat: number; minLng: number; maxLng: number } | null>(null);

  const debouncedBounds = useDebounce(mapBounds, 300);

  const handleLocationChange = async (value: string, id?: string) => {
    setLocation(value);
    if (id) {
      setPlaceId(id);
      // Fetch place details and listings
      try {
        const mappedRoomType = roomType === "private" ? "private_room" : roomType === "shared" ? "shared_room" : undefined;
        const mappedBhkType = layout === "studio" ? "RK" : layout === "1br" ? "1BHK" : layout === "2br" ? "2BHK" : layout === "3br+" ? "3BHK" : undefined;

        const data = await apiClient.searchPlaceListings(id, {
          radiusKm: radius || 5,
          minRent: minPrice ? parseInt(minPrice) : undefined,
          maxRent: maxPrice ? parseInt(maxPrice) : undefined,
          roomType: mappedRoomType ? [mappedRoomType] : undefined,
          bhkType: mappedBhkType ? [mappedBhkType] : undefined,
          amenities: amenities,
        });

        // Map center update is removed as new API doesn't return place details directly in the same structure
        // If we need map center, we might need to get it from the autocomplete selection or a separate call
        // For now, we'll assume the list update is the priority.

        setListings(data.listings || []);
        setTotalElements(data.totalElements || 0);
      } catch (error) {
        console.error("Error fetching place listings:", error);
      }
    }
  };

  const adjustRadius = (delta: number) => {
    setRadius(prev => Math.max(1, Math.min(100, prev + delta)));
  };

  const handleRadiusInput = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num)) {
      setRadius(Math.max(1, Math.min(100, num)));
    } else if (value === "") {
      setRadius(1);
    }
  };

  // Fetch listings when map bounds change (map mode only)
  useEffect(() => {
    if (viewMode === "map" && debouncedBounds) {
      const fetchMapListings = async () => {
        try {
          setLoading(true);
          const filters = {
            minRent: minPrice ? parseInt(minPrice) : undefined,
            maxRent: maxPrice ? parseInt(maxPrice) : undefined,
            layoutType: roomType ? [roomType] : undefined,
            amenities: amenities.length > 0 ? amenities : undefined,
          };
          const data = await apiClient.searchListingsByMap(debouncedBounds, filters);
          setListings(data.content || []);
          setTotalElements(data.totalElements || 0);
        } catch (error) {
          console.error("Error fetching map listings:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchMapListings();
    }
  }, [debouncedBounds, viewMode, minPrice, maxPrice, roomType, amenities]);

  // Fetch recent rooms on initial load (list mode)
  useEffect(() => {
    if (viewMode === "list") {
      const fetchRecentRooms = async () => {
        try {
          setLoading(true);
          const data = await apiClient.searchRecentRooms(0, 20);
          setListings(data.content || []);
          setTotalElements(data.totalElements || 0);
        } catch (error) {
          console.error("Error fetching recent rooms:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchRecentRooms();
    }
  }, [viewMode]);

  return (
    <>
      {viewMode === "list" ? (
        <div className="min-h-screen">
          {/* Search Bar */}
          <div className="md:sticky top-0 z-40 bg-background border-b border-border">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex-1 min-w-[300px]">
                  <LocationAutocomplete
                    value={location}
                    onChange={handleLocationChange}
                    placeholder="Where are you looking?"
                  />
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-12">
                      <IndianRupee className="h-4 w-4 mr-2" />
                      {priceType === "monthly" ? "Monthly" : "Target"}
                      {(minPrice || maxPrice) && (
                        <span className="ml-2">
                          {minPrice && `₹${parseInt(minPrice).toLocaleString('en-IN')}`}{minPrice && maxPrice && "-"}{maxPrice && `₹${parseInt(maxPrice).toLocaleString('en-IN')}`}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Button
                          variant={priceType === "monthly" ? "default" : "outline"}
                          onClick={() => setPriceType("monthly")}
                          className="flex-1"
                        >
                          Monthly
                        </Button>
                        <Button
                          variant={priceType === "target" ? "default" : "outline"}
                          onClick={() => setPriceType("target")}
                          className="flex-1"
                        >
                          Target
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          type="number"
                        />
                        <Input
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          type="number"
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[120px] h-12">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="relevant">Most Relevant</SelectItem>
                  </SelectContent>
                </Select>

                <div className="w-[200px] px-2">
                  <PremiumSlider
                    value={radius}
                    onChange={setRadius}
                    onCommit={(val) => {
                      // Trigger search with new radius
                      if (placeId) {
                        handleLocationChange(location, placeId);
                      }
                    }}
                    min={1}
                    max={100}
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={() => setViewMode("map")}
                  className="h-12"
                >
                  <MapIcon className="h-4 w-4 mr-2" />
                  Map
                </Button>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="h-12">
                      <Plus className="h-4 w-4 mr-2" />
                      More
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>More Filters</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4 mt-6">
                      <div>
                        <Label>Gender</Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div>
                        <Label>Verifications</Label>
                        <div className="space-y-2 mt-2">
                          {["ID Verified", "Background Check", "Income Verified"].map((item) => (
                            <div key={item} className="flex items-center gap-2">
                              <Checkbox
                                checked={verifications.includes(item)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setVerifications([...verifications, item]);
                                  } else {
                                    setVerifications(verifications.filter((v) => v !== item));
                                  }
                                }}
                              />
                              <label className="text-sm">{item}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label>Layout</Label>
                        <Select value={layout} onValueChange={setLayout}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="studio">Studio</SelectItem>
                            <SelectItem value="1br">1 Bedroom</SelectItem>
                            <SelectItem value="2br">2 Bedroom</SelectItem>
                            <SelectItem value="3br+">3+ Bedroom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div>
                        <Label>Amenities</Label>
                        <div className="space-y-2 mt-2">
                          {["WiFi", "Parking", "Furnished", "Pet Friendly", "Gym", "Pool"].map((item) => (
                            <div key={item} className="flex items-center gap-2">
                              <Checkbox
                                checked={amenities.includes(item)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setAmenities([...amenities, item]);
                                  } else {
                                    setAmenities(amenities.filter((a) => a !== item));
                                  }
                                }}
                              />
                              <label className="text-sm">{item}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label>Duration</Label>
                        <Select value={duration} onValueChange={setDuration}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="short">Short Term (1-3 months)</SelectItem>
                            <SelectItem value="medium">Medium Term (3-6 months)</SelectItem>
                            <SelectItem value="long">Long Term (6+ months)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div>
                        <Label>Type</Label>
                        <Select value={roomType} onValueChange={setRoomType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="private">Private Room</SelectItem>
                            <SelectItem value="shared">Shared Room</SelectItem>
                            <SelectItem value="entire">Entire Place</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading..." : `${totalElements} rooms`}
              </p>
              <Button variant="ghost" size="sm">
                Clear filters
              </Button>
            </div>
          </div>

          {/* Results Grid */}
          <div className="container mx-auto px-4 pb-12">
            {!loading && listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-32 h-32 mb-6 flex items-center justify-center">
                  <Search className="w-20 h-20 text-muted-foreground/40" strokeWidth={1} />
                </div>
                <h2 className="text-2xl font-semibold text-muted-foreground mb-4">No results</h2>
                <p className="text-center text-muted-foreground max-w-md">
                  Try expanding the search area, or connect with other renters that are also looking in your area
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-card rounded-lg border border-border overflow-hidden">
                      <Skeleton className="aspect-[4/3]" />
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="space-y-1 flex-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))
                ) : (
                  listings.map((listing) => (
                    <div
                      key={listing.id}
                      className="group bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                      onClick={() => {
                        navigate(`/listings/${listing.id}`);
                      }}
                    >
                      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                        {listing.images?.[0] && (
                          <img
                            src={listing.images[0]}
                            alt={listing.description || "Room"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>

                      <div className="p-4 space-y-2">
                        {/* Price and Type */}
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-lg font-bold text-foreground">
                              ₹{(listing.monthlyRent || 0).toLocaleString('en-IN')}
                              <span className="text-xs font-normal text-muted-foreground ml-1">/mo</span>
                            </p>
                            <p className="text-sm text-muted-foreground font-medium mt-0.5">
                              {listing.listingType === "PRIVATE_ROOM" ? "Private Room" :
                                listing.listingType === "SHARED_ROOM" ? "Shared Room" : "Full House"}
                              <span className="mx-1.5">•</span>
                              {listing.layoutType || "Studio"}
                            </p>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground pt-1">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <p className="line-clamp-1">
                            {listing.addressText || "Location not specified"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 z-50 bg-background">
          {/* Map View Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-wrap gap-2 items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-12 w-12"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>

                <div className="flex-1 min-w-[200px]">
                  <LocationAutocomplete
                    value={location}
                    onChange={handleLocationChange}
                    placeholder="Where are you looking?"
                  />
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-12">
                      <IndianRupee className="h-4 w-4 mr-2" />
                      {priceType === "monthly" ? "Monthly" : "Target"}
                      {(minPrice || maxPrice) && (
                        <span className="ml-2">
                          {minPrice && `₹${parseInt(minPrice).toLocaleString('en-IN')}`}{minPrice && maxPrice && "-"}{maxPrice && `₹${parseInt(maxPrice).toLocaleString('en-IN')}`}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Button
                          variant={priceType === "monthly" ? "default" : "outline"}
                          onClick={() => setPriceType("monthly")}
                          className="flex-1"
                        >
                          Monthly
                        </Button>
                        <Button
                          variant={priceType === "target" ? "default" : "outline"}
                          onClick={() => setPriceType("target")}
                          className="flex-1"
                        >
                          Target
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          type="number"
                        />
                        <Input
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          type="number"
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button
                  variant="outline"
                  onClick={() => setViewMode("list")}
                  className="h-12"
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="h-12">
                      <Minus className="h-4 w-4 mr-2" />
                      More
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>More Filters</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4 mt-6">
                      <div>
                        <Label>Gender</Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div>
                        <Label>Verifications</Label>
                        <div className="space-y-2 mt-2">
                          {["ID Verified", "Background Check", "Income Verified"].map((item) => (
                            <div key={item} className="flex items-center gap-2">
                              <Checkbox
                                checked={verifications.includes(item)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setVerifications([...verifications, item]);
                                  } else {
                                    setVerifications(verifications.filter((v) => v !== item));
                                  }
                                }}
                              />
                              <label className="text-sm">{item}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label>Layout</Label>
                        <Select value={layout} onValueChange={setLayout}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="studio">Studio</SelectItem>
                            <SelectItem value="1br">1 Bedroom</SelectItem>
                            <SelectItem value="2br">2 Bedroom</SelectItem>
                            <SelectItem value="3br+">3+ Bedroom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div>
                        <Label>Amenities</Label>
                        <div className="space-y-2 mt-2">
                          {["WiFi", "Parking", "Furnished", "Pet Friendly", "Gym", "Pool"].map((item) => (
                            <div key={item} className="flex items-center gap-2">
                              <Checkbox
                                checked={amenities.includes(item)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setAmenities([...amenities, item]);
                                  } else {
                                    setAmenities(amenities.filter((a) => a !== item));
                                  }
                                }}
                              />
                              <label className="text-sm">{item}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label>Duration</Label>
                        <Select value={duration} onValueChange={setDuration}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="short">Short Term (1-3 months)</SelectItem>
                            <SelectItem value="medium">Medium Term (3-6 months)</SelectItem>
                            <SelectItem value="long">Long Term (6+ months)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div>
                        <Label>Type</Label>
                        <Select value={roomType} onValueChange={setRoomType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="private">Private Room</SelectItem>
                            <SelectItem value="shared">Shared Room</SelectItem>
                            <SelectItem value="entire">Entire Place</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>

          {/* Full Screen Map */}
          <div className="h-full w-full">
            <GoogleMap
              center={mapCenter}
              listings={listings}
              onBoundsChange={setMapBounds}
            />
          </div>
        </div>
      )}
    </>
  );
};
