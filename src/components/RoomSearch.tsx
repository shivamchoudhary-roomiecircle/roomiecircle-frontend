import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MapPin, Search, IndianRupee, Bed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const RoomSearch = () => {
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState([5]);
  const [roomType, setRoomType] = useState("");
  const [priceRange, setPriceRange] = useState([15000]);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSearch = () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    console.log({ location, radius: radius[0], roomType, priceRange: priceRange[0] });
    // TODO: Implement search functionality with backend
  };

  return (
    <div className="space-y-6">
      {/* Location Input */}
      <div className="space-y-2">
        <Label htmlFor="location" className="text-base font-semibold">
          Location
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="location"
            placeholder="Enter city or locality (e.g., Koramangala, Bangalore)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>

      {/* Radius Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-base font-semibold">Search Radius</Label>
          <Badge variant="secondary" className="text-sm">
            {radius[0]} km
          </Badge>
        </div>
        <Slider
          value={radius}
          onValueChange={setRadius}
          max={50}
          min={1}
          step={1}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">
          Search within {radius[0]} km of your location
        </p>
      </div>

      {/* Room Type */}
      <div className="space-y-2">
        <Label htmlFor="room-type" className="text-base font-semibold flex items-center gap-2">
          <Bed className="h-4 w-4" />
          Room Type
        </Label>
        <Select value={roomType} onValueChange={setRoomType}>
          <SelectTrigger id="room-type" className="h-12 text-base">
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

      {/* Price Range */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-base font-semibold flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            Maximum Budget
          </Label>
          <Badge variant="secondary" className="text-sm">
            ₹{priceRange[0].toLocaleString('en-IN')}/month
          </Badge>
        </div>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={50000}
          min={2000}
          step={1000}
          className="w-full"
        />
      </div>

      {/* Search Button */}
      <Button 
        onClick={handleSearch}
        size="lg"
        variant="hero"
        className="w-full h-14 text-lg mt-8"
      >
        <Search className="mr-2 h-5 w-5" />
        Search Available Rooms
      </Button>

      {/* Quick Filters */}
      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground mb-3">Popular preferences:</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">Vegetarian only</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">Furnished</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">Wi-Fi included</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">Pet friendly</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">Parking available</Badge>
        </div>
      </div>
    </div>
  );
};

export default RoomSearch;
