import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/contexts/ConfigContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, ArrowUpDown, Map as MapIcon, Plus, Minus, ArrowLeft, List, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GoogleMap } from "./GoogleMap";
import { apiClient } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { PremiumSlider } from "@/components/ui/PremiumSlider";
import { RoomListingCard } from "@/components/search/RoomListingCard.tsx";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Listing } from "@/types/listing";

export const RoomsResults = () => {
  const navigate = useNavigate();
  const { config } = useConfig();
  const [location, setLocation] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>();
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
  const observerTarget = useRef(null);

  const handleLocationChange = (value: string, id?: string) => {
    setLocation(value);
    if (id) {
      setPlaceId(id);
    } else if (value === "") {
      setPlaceId("");
    }
  };

  const mappedRoomType = roomType === "private" ? "private_room" : roomType === "shared" ? "shared_room" : roomType === "entire" ? "entire_place" : undefined;
  const mappedBhkType = layout === "studio" ? "RK" : layout === "1br" ? "1BHK" : layout === "2br" ? "2BHK" : layout === "3br+" ? "3BHK" : undefined;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['rooms', placeId, radius, minPrice, maxPrice, roomType, layout, amenities, viewMode, mapBounds],
    queryFn: async ({ pageParam = 0 }) => {
      if (viewMode === 'map' && mapBounds) {
        return await apiClient.searchListingsByMap(mapBounds, {
          rentMin: minPrice ? parseInt(minPrice) : undefined,
          rentMax: maxPrice ? parseInt(maxPrice) : undefined,
          roomTypes: mappedRoomType ? [mappedRoomType] : undefined,
          bhkTypes: mappedBhkType ? [mappedBhkType] : undefined,
          amenities: amenities,
          page: pageParam,
          size: 20
        });
      } else if (placeId) {
        return await apiClient.searchPlaceListings(placeId, {
          radiusKm: radius || 5,
          rentMin: minPrice ? parseInt(minPrice) : undefined,
          rentMax: maxPrice ? parseInt(maxPrice) : undefined,
          roomType: mappedRoomType ? [mappedRoomType] : undefined,
          bhkType: mappedBhkType ? [mappedBhkType] : undefined,
          amenities: amenities,
          page: pageParam,
          size: 10
        });
      } else {
        return await apiClient.searchRecentRooms(pageParam, 20);
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.last ? undefined : lastPage.page + 1;
    },
    initialPageParam: 0,
    enabled: viewMode === 'list' || (viewMode === 'map' && !!mapBounds),
  });

  // Effect to resolve placeId to coordinates when switching to map view
  useEffect(() => {
    if (viewMode === 'map' && placeId && !mapCenter) {
      const geocoder = new (window as any).google.maps.Geocoder();
      geocoder.geocode({ placeId: placeId }, (results: any, status: any) => {
        if (status === "OK" && results[0]) {
          setMapCenter({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        }
      });
    }
  }, [viewMode, placeId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const listings = data?.pages.flatMap((page) => page.content) || [];
  const totalElements = data?.pages[0]?.totalElements || 0;

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
                {isLoading ? "Loading..." : `${totalElements} rooms`}
              </p>
              <Button variant="ghost" size="sm">
                Clear filters
              </Button>
            </div>
          </div>

          {/* Results Grid */}
          <div className="container mx-auto px-4 pb-12">
            {!isLoading && listings.length === 0 ? (
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
                  {listings.map((listing: Listing) => (
                    <RoomListingCard
                      key={listing.id}
                      listing={listing}
                      onClick={() => navigate(`/listings/${listing.id}`)}
                    />
                  ))}

                  {/* Loading Skeletons */}
                  {(isLoading || isFetchingNextPage) && (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={`skeleton-${i}`} className="bg-card rounded-xl border border-border overflow-hidden">
                        <Skeleton className="aspect-[4/3]" />
                        <div className="p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <div className="space-y-1 flex-1">
                              <Skeleton className="h-3 w-20" />
                              <Skeleton className="h-2 w-16" />
                            </div>
                          </div>
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    ))
                  )}
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
