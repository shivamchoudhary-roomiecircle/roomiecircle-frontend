import { useState } from "react";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Plus, Minus, Grid3x3, Heart } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const RoommatesResults = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "swipe">("list");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [radius, setRadius] = useState(10);

  // More filters state
  const [gender, setGender] = useState("");
  const [verifications, setVerifications] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [status, setStatus] = useState("");

  const handleLocationChange = (value: string, id?: string) => {
    setLocation(value);
    if (id) setPlaceId(id);
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

  return (
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
                  Budget
                  {(minBudget || maxBudget) && (
                    <span className="ml-2">
                      {minBudget && `$${minBudget}`}{minBudget && maxBudget && "-"}{maxBudget && `$${maxBudget}`}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <Label>Budget Range</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Min"
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                      type="number"
                    />
                    <Input
                      placeholder="Max"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      type="number"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-12">
                  Age
                  {(minAge || maxAge) && (
                    <span className="ml-2">
                      {minAge}{minAge && maxAge && "-"}{maxAge}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <Label>Age Range</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Min"
                      value={minAge}
                      onChange={(e) => setMinAge(e.target.value)}
                      type="number"
                    />
                    <Input
                      placeholder="Max"
                      value={maxAge}
                      onChange={(e) => setMaxAge(e.target.value)}
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
                <SelectItem value="relevant">Most Relevant</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="age">Age</SelectItem>
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
                    <Label>Lifestyle</Label>
                    <div className="space-y-2 mt-2">
                      {["Early Bird", "Night Owl", "Social", "Quiet", "Clean", "Pets"].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox
                            checked={lifestyle.includes(item)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setLifestyle([...lifestyle, item]);
                              } else {
                                setLifestyle(lifestyle.filter((l) => l !== item));
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
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button
              variant={viewMode === "swipe" ? "default" : "outline"}
              onClick={() => setViewMode(viewMode === "swipe" ? "list" : "swipe")}
              className="h-12"
            >
              {viewMode === "swipe" ? <Grid3x3 className="h-4 w-4 mr-2" /> : <Heart className="h-4 w-4 mr-2" />}
              {viewMode === "swipe" ? "List" : "Swipe"}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            9,200 renters/roommates
          </p>
          <Button variant="ghost" size="sm">
            Clear filters
          </Button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="container mx-auto px-4 pb-12">
        {viewMode === "list" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {/* Placeholder cards - will be populated with actual data */}
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-muted relative">
                  <div className="absolute top-2 right-2 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs">⚡</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        Name
                        <span className="text-xs text-muted-foreground">· {20 + i}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">TODAY</p>
                    </div>
                  </div>
                  {!isAuthenticated && (
                    <div className="bg-muted/50 rounded-md p-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <button
                        onClick={() => navigate("/auth/login")}
                        className="underline hover:text-foreground transition-colors"
                      >
                        Log in to view renter preferences
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="h-[calc(100vh-300px)] bg-card rounded-lg border border-border overflow-hidden relative shadow-xl">
              <div className="absolute inset-0 bg-muted" />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                <h3 className="text-2xl font-bold text-white mb-1">Name, 25</h3>
                <p className="text-white/80 text-sm">TODAY</p>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <Button size="lg" variant="outline" className="rounded-full w-16 h-16">
                ✕
              </Button>
              <Button size="lg" variant="default" className="rounded-full w-16 h-16 bg-primary">
                ♥
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
