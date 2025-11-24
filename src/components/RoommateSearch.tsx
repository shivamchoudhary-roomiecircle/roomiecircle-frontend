import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MapPin, Search, Users, IndianRupee, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MoreFiltersSection from "./MoreFiltersSection";

const RoommateSearch = () => {
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState([5]);
  const [occupation, setOccupation] = useState("");
  const [maxBudget, setMaxBudget] = useState([15000]);
  const [lifestyle, setLifestyle] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSearch = () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    console.log({ location, radius: radius[0], occupation, maxBudget: maxBudget[0], lifestyle });
    // TODO: Implement search functionality with backend
  };

  return (
    <div className="space-y-5">
      {/* Location Search Bar */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          id="location-roommate"
          placeholder="Search location (e.g., Indiranagar, Bangalore)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="pl-10 h-12 text-base border-2 focus-visible:ring-2 rounded-xl"
        />
      </div>

      {/* Basic Filters - Visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Occupation Filter */}
        <div className="space-y-2">
          <Label htmlFor="occupation" className="text-sm font-medium flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Looking for
          </Label>
          <Select value={occupation} onValueChange={setOccupation}>
            <SelectTrigger id="occupation" className="h-11 rounded-lg">
              <SelectValue placeholder="Select occupation type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="professional">Working Professionals</SelectItem>
              <SelectItem value="any">Any</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Max Budget Filter */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <IndianRupee className="h-3.5 w-3.5" />
              Max Budget
            </Label>
            <Badge variant="secondary" className="text-xs font-semibold tabular-nums">
              ₹{maxBudget[0].toLocaleString('en-IN')}
            </Badge>
          </div>
          <div className="pt-1.5">
            <Slider
              value={maxBudget}
              onValueChange={setMaxBudget}
              max={30000}
              min={2000}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
              <span>₹2k</span>
              <span>₹30k</span>
            </div>
          </div>
        </div>
      </div>

      {/* Radius Filter - Modern Design with Presets */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5" />
            Search Radius
          </Label>
          <Badge variant="secondary" className="text-xs font-semibold tabular-nums">
            {radius[0]} km
          </Badge>
        </div>

        {/* Preset Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[5, 10, 25, 50].map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={radius[0] === preset ? "default" : "outline"}
              size="sm"
              onClick={() => setRadius([preset])}
              className="h-9 text-xs font-medium"
            >
              {preset} km
            </Button>
          ))}
        </div>

        {/* Custom Slider */}
        <div className="space-y-2">
          <Slider
            value={radius}
            onValueChange={setRadius}
            max={50}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 km</span>
            <span>50 km</span>
          </div>
        </div>
      </div>

      {/* More Filters Section */}
      <MoreFiltersSection>
        {/* Lifestyle Preferences */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Lifestyle Preferences</Label>
          <RadioGroup value={lifestyle} onValueChange={setLifestyle}>
            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
              <RadioGroupItem value="early-bird" id="early-bird" />
              <Label htmlFor="early-bird" className="cursor-pointer flex-1">
                <span className="font-medium text-sm">Early Bird</span>
                <p className="text-xs text-muted-foreground">Early to bed, early to rise</p>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
              <RadioGroupItem value="night-owl" id="night-owl" />
              <Label htmlFor="night-owl" className="cursor-pointer flex-1">
                <span className="font-medium text-sm">Night Owl</span>
                <p className="text-xs text-muted-foreground">Active during late hours</p>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
              <RadioGroupItem value="social" id="social" />
              <Label htmlFor="social" className="cursor-pointer flex-1">
                <span className="font-medium text-sm">Social Butterfly</span>
                <p className="text-xs text-muted-foreground">Loves hosting and hanging out</p>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
              <RadioGroupItem value="quiet" id="quiet" />
              <Label htmlFor="quiet" className="cursor-pointer flex-1">
                <span className="font-medium text-sm">Quiet & Private</span>
                <p className="text-xs text-muted-foreground">Prefers peaceful environment</p>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </MoreFiltersSection>

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        size="lg"
        variant="trust"
        className="w-full h-12 text-base font-semibold rounded-xl"
      >
        <Search className="mr-2 h-4 w-4" />
        Find Compatible Roommates
      </Button>

      {/* Quick Filters */}
      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground mb-3">Quick preferences:</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs rounded-full">Vegetarian</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs rounded-full">Non-smoker</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs rounded-full">Pet lover</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs rounded-full">Tidy & organized</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs rounded-full">Gym enthusiast</Badge>
        </div>
      </div>
    </div>
  );
};

export default RoommateSearch;
