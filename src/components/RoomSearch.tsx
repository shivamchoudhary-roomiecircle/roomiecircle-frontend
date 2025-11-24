import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MapPin, Search, IndianRupee, Bed, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MoreFiltersSection from "./MoreFiltersSection";

const RoomSearch = () => {
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState([5]);
  const [roomType, setRoomType] = useState("");
  const [maxBudget, setMaxBudget] = useState([15000]);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSearch = () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    console.log({ location, radius: radius[0], roomType, maxBudget: maxBudget[0] });
    // TODO: Implement search functionality with backend
  };

  return (
    <div className="space-y-5">
      {/* Location Search Bar */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          id="location"
          placeholder="Search location (e.g., Koramangala, Bangalore)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="pl-10 h-12 text-base border-2 focus-visible:ring-2 rounded-xl"
        />
      </div>

      {/* Basic Filters - Visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Room Type */}
        <div className="space-y-2">
          <Label htmlFor="room-type" className="text-sm font-medium flex items-center gap-1.5">
            <Bed className="h-3.5 w-3.5" />
            Room Type
          </Label>
          <Select value={roomType} onValueChange={setRoomType}>
            <SelectTrigger id="room-type" className="h-11 rounded-lg">
              <SelectValue placeholder="Select room type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Room</SelectItem>
              <SelectItem value="shared">Shared Room (2 people)</SelectItem>
              <SelectItem value="triple">Triple Sharing</SelectItem>
              <SelectItem value="1bhk">1 BHK</SelectItem>
              <SelectItem value="2bhk">2 BHK</SelectItem>
              <SelectItem value="3bhk">3 BHK</SelectItem>
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
              max={50000}
              min={2000}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
              <span>₹2k</span>
              <span>₹50k</span>
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

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        size="lg"
        variant="hero"
        className="w-full h-12 text-base font-semibold rounded-xl"
      >
        <Search className="mr-2 h-4 w-4" />
        Search Available Rooms
      </Button>

      {/* Quick Filters */}
      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground mb-3">Quick preferences:</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs rounded-full">Vegetarian only</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs rounded-full">Furnished</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs rounded-full">Wi-Fi included</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs rounded-full">Pet friendly</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted text-xs rounded-full">Parking available</Badge>
        </div>
      </div>
    </div>
  );
};

export default RoomSearch;
