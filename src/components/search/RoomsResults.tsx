import { useState, useEffect } from "react";
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

export const RoomsResults = () => {
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
  const [urgency, setUrgency] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [radius, setRadius] = useState(10);

  // More filters state
  const [gender, setGender] = useState("");
  const [verifications, setVerifications] = useState<string[]>([]);
  const [layout, setLayout] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [duration, setDuration] = useState("");
  const [roomType, setRoomType] = useState("");

  const handleLocationChange = async (value: string, id?: string) => {
    setLocation(value);
    if (id) {
      setPlaceId(id);
      // Fetch place details and listings
      try {
        const data = await apiClient.searchPlaceListings(id, {
          radiusKm: radius || 5,
          minRent: minPrice ? parseInt(minPrice) : undefined,
          maxRent: maxPrice ? parseInt(maxPrice) : undefined,
          availableAfter: urgency || undefined,
          layoutType: roomType ? [roomType] : undefined,
          amenities: amenities,
        });
        
        if (data.place) {
          setMapCenter({
            lat: data.place.latitude,
            lng: data.place.longitude,
          });
        }
        
        setListings(data.listings || []);
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

  useEffect(() => {
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
  }, []);

  return (
    <>
      {viewMode === "list" ? (
        <div className="min-h-screen bg-background">
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

                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger className="w-[140px] h-12">
                    <Clock className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    {config?.LISTING_URGENCY?.map((item) => (
                      <SelectItem key={item.key} value={item.key}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

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

                <div className="flex items-center gap-2 border border-border rounded-lg px-3 h-12">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => adjustRadius(-1)}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={radius}
                    onChange={(e) => handleRadiusInput(e.target.value)}
                    className="h-8 w-16 text-center text-sm border-0 p-0 focus-visible:ring-0"
                    min={1}
                    max={100}
                  />
                  <span className="text-sm font-medium">km</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => adjustRadius(1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
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
                    <div key={listing.id} className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-[4/3] bg-muted relative">
                        {listing.images?.[0] && (
                          <img 
                            src={listing.images[0]} 
                            alt={listing.description || "Room"} 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-10 h-10">
                              {listing.lister?.profilePicture && (
                                <AvatarImage src={listing.lister.profilePicture} alt={listing.lister.name || "Host"} />
                              )}
                              <AvatarFallback className="bg-muted text-foreground">
                                {listing.lister?.name?.charAt(0)?.toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">
                                {listing.lister?.name || "Host"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {listing.listingType === "FULL_HOUSE" 
                                  ? "Full House" 
                                  : listing.existingRoommates?.length 
                                    ? `${listing.existingRoommates.length} ROOMMATE${listing.existingRoommates.length !== 1 ? "S" : ""}`
                                    : listing.layoutType || "Private listing"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-2xl font-bold mb-1">
                          ₹{listing.monthlyRent?.toLocaleString('en-IN') || 0} 
                          <span className="text-sm font-normal text-muted-foreground">/mo</span>
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {listing.listingType || "Room"} · {listing.bedroomCount || 0} Bedrooms · {listing.propertyType?.[0] || "Property"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {listing.availableDate ? new Date(listing.availableDate).toLocaleDateString() : "Available"}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                          <MapPin className="h-3 w-3" />
                          {listing.addressText || "Location"}
                        </p>
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

                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger className="w-[140px] h-12">
                    <Clock className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="1week">Within 1 week</SelectItem>
                    <SelectItem value="1month">Within 1 month</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>

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
            <GoogleMap center={mapCenter} listings={listings} />
          </div>
        </div>
      )}
    </>
  );
};
