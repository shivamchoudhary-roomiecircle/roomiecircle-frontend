import { useState, useEffect, useRef, useCallback } from "react";
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
import { RoomCard } from "./RoomCard";

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

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  const handleLocationChange = (value: string, id?: string) => {
    setLocation(value);
    if (id) {
      setPlaceId(id);
    } else if (value === "") {
      setPlaceId("");
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

  // Unified fetch logic for List View
  const fetchListings = useCallback(async (pageParam: number, shouldAppend: boolean) => {
    if (viewMode !== "list") return;

    setLoading(true);
    try {
      if (placeId) {
        // Search by location and filters
        const mappedRoomType = roomType === "private" ? "private_room" : roomType === "shared" ? "shared_room" : roomType === "entire" ? "entire_place" : undefined;
        const mappedBhkType = layout === "studio" ? "RK" : layout === "1br" ? "1BHK" : layout === "2br" ? "2BHK" : layout === "3br+" ? "3BHK" : undefined;

        const data = await apiClient.searchPlaceListings(placeId, {
          radiusKm: radius || 5,
          rentMin: minPrice ? parseInt(minPrice) : undefined,
          rentMax: maxPrice ? parseInt(maxPrice) : undefined,
          roomType: mappedRoomType ? [mappedRoomType] : undefined,
          bhkType: mappedBhkType ? [mappedBhkType] : undefined,
          amenities: amenities,
          page: pageParam,
          size: 10
        });

        if (shouldAppend) {
          setListings(prev => [...prev, ...data.listings]);
        } else {
          setListings(data.listings || []);
        }
        setTotalElements(data.totalElements || 0);
        setHasMore(data.listings.length === 10); // Assuming size is 10
      } else {
        // Fallback to recent rooms if no location selected
        const data = await apiClient.searchRecentRooms(pageParam, 20);
        if (shouldAppend) {
          setListings(prev => [...prev, ...data.content]);
        } else {
          setListings(data.content || []);
        }
        setTotalElements(data.totalElements || 0);
        setHasMore(!data.last);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
      if (!shouldAppend) setListings([]);
    } finally {
      setLoading(false);
    }
  }, [viewMode, placeId, radius, minPrice, maxPrice, roomType, layout, amenities]);

  // Search/Reset Effect
  useEffect(() => {
    if (viewMode !== "list") return;

    const timeoutId = setTimeout(() => {
      setPage(0);
      fetchListings(0, false);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [fetchListings]);

  // Load More Effect
  useEffect(() => {
    if (page === 0) return;
    fetchListings(page, true);
  }, [page, fetchListings]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  return (
    <>
      {viewMode === "list" ? (
        <div className="pb-8">
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

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-12 h-12 p-0 flex items-center justify-center">
                    <ArrowUpDown className="h-4 w-4" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="relevant">Most Relevant</SelectItem>
                  </SelectContent>
                </Select>
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
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {loading && page === 0 ? (
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
                      <RoomCard
                        key={listing.id}
                        listing={listing}
                        onClick={() => navigate(`/listings/${listing.id}`)}
                      />
                    ))
                  )}
                  {/* Loading indicator for next page */}
                  {loading && page > 0 && Array.from({ length: 4 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="bg-card rounded-lg border border-border overflow-hidden">
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
                  ))}
                </div>
                {/* Observer Target */}
                <div ref={observerTarget} className="h-10 w-full" />
              </>
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
