import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MapPin, Search, Briefcase, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const RoommateSearch = () => {
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState([5]);
  const [occupation, setOccupation] = useState("");
  const [lifestyle, setLifestyle] = useState("");

  const handleSearch = () => {
    console.log({ location, radius: radius[0], occupation, lifestyle });
    // TODO: Implement search functionality with backend
  };

  return (
    <div className="space-y-6">
      {/* Location Input */}
      <div className="space-y-2">
        <Label htmlFor="location-roommate" className="text-base font-semibold">
          Location
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="location-roommate"
            placeholder="Enter city or locality"
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
      </div>

      {/* Occupation */}
      <div className="space-y-2">
        <Label htmlFor="occupation" className="text-base font-semibold">
          Looking for
        </Label>
        <Select value={occupation} onValueChange={setOccupation}>
          <SelectTrigger id="occupation" className="h-12 text-base">
            <SelectValue placeholder="Select occupation type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Students
              </div>
            </SelectItem>
            <SelectItem value="professional">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Working Professionals
              </div>
            </SelectItem>
            <SelectItem value="any">Any</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lifestyle Preferences */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Lifestyle Preferences</Label>
        <RadioGroup value={lifestyle} onValueChange={setLifestyle}>
          <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
            <RadioGroupItem value="early-bird" id="early-bird" />
            <Label htmlFor="early-bird" className="cursor-pointer flex-1">
              <span className="font-medium">Early Bird</span>
              <p className="text-sm text-muted-foreground">Early to bed, early to rise</p>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
            <RadioGroupItem value="night-owl" id="night-owl" />
            <Label htmlFor="night-owl" className="cursor-pointer flex-1">
              <span className="font-medium">Night Owl</span>
              <p className="text-sm text-muted-foreground">Active during late hours</p>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
            <RadioGroupItem value="social" id="social" />
            <Label htmlFor="social" className="cursor-pointer flex-1">
              <span className="font-medium">Social Butterfly</span>
              <p className="text-sm text-muted-foreground">Loves hosting and hanging out</p>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
            <RadioGroupItem value="quiet" id="quiet" />
            <Label htmlFor="quiet" className="cursor-pointer flex-1">
              <span className="font-medium">Quiet & Private</span>
              <p className="text-sm text-muted-foreground">Prefers peaceful environment</p>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Search Button */}
      <Button 
        onClick={handleSearch}
        size="lg"
        variant="trust"
        className="w-full h-14 text-lg mt-8"
      >
        <Search className="mr-2 h-5 w-5" />
        Find Compatible Roommates
      </Button>

      {/* Quick Filters */}
      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground mb-3">Other preferences:</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">Vegetarian</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">Non-smoker</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">Pet lover</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">Tidy & organized</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">Gym enthusiast</Badge>
        </div>
      </div>
    </div>
  );
};

export default RoommateSearch;
