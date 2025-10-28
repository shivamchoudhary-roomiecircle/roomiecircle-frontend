import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, MapPin, IndianRupee, Upload } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PostRoom = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    roomType: "",
    rent: "",
    deposit: "",
    description: "",
    amenities: [] as string[],
    preferences: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Room listing:", formData);
    toast.success("Room listing created successfully! (Demo mode - backend needed)");
    // TODO: Implement backend submission
  };

  const amenitiesList = ["Wi-Fi", "Furnished", "AC", "Parking", "Kitchen", "Washing Machine", "Gym", "Security"];
  const preferencesList = ["Vegetarian only", "Working professionals", "Students", "No smoking", "Pet friendly"];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">List Your Room</h1>
              <p className="text-muted-foreground">
                Fill in the details below to create your room listing
              </p>
            </div>

            {/* Form */}
            <Card className="p-6 md:p-8 shadow-card">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-semibold flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Listing Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Spacious room in 2BHK near IT Park"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Koramangala, Bangalore"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>

                {/* Room Type */}
                <div className="space-y-2">
                  <Label htmlFor="room-type" className="text-base font-semibold">
                    Room Type
                  </Label>
                  <Select 
                    value={formData.roomType} 
                    onValueChange={(value) => setFormData({ ...formData, roomType: value })}
                  >
                    <SelectTrigger id="room-type" className="h-12">
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Room</SelectItem>
                      <SelectItem value="shared">Shared Room</SelectItem>
                      <SelectItem value="1bhk">1 BHK</SelectItem>
                      <SelectItem value="2bhk">2 BHK</SelectItem>
                      <SelectItem value="3bhk">3 BHK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rent & Deposit */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rent" className="text-base font-semibold flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      Monthly Rent
                    </Label>
                    <Input
                      id="rent"
                      type="number"
                      placeholder="10000"
                      value={formData.rent}
                      onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deposit" className="text-base font-semibold">
                      Security Deposit
                    </Label>
                    <Input
                      id="deposit"
                      type="number"
                      placeholder="20000"
                      value={formData.deposit}
                      onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-semibold">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your room, nearby amenities, transportation, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={5}
                  />
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Amenities Available</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {amenitiesList.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={formData.amenities.includes(amenity)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({ ...formData, amenities: [...formData.amenities, amenity] });
                            } else {
                              setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== amenity) });
                            }
                          }}
                        />
                        <Label htmlFor={amenity} className="text-sm cursor-pointer">
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Tenant Preferences</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {preferencesList.map((pref) => (
                      <div key={pref} className="flex items-center space-x-2">
                        <Checkbox
                          id={pref}
                          checked={formData.preferences.includes(pref)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({ ...formData, preferences: [...formData.preferences, pref] });
                            } else {
                              setFormData({ ...formData, preferences: formData.preferences.filter(p => p !== pref) });
                            }
                          }}
                        />
                        <Label htmlFor={pref} className="text-sm cursor-pointer">
                          {pref}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Photos Upload */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Photos (Coming Soon)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Photo upload will be available once backend is connected
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button 
                    type="submit"
                    size="lg"
                    variant="hero"
                    className="w-full h-14 text-lg"
                  >
                    Create Listing
                  </Button>
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    By posting, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PostRoom;
