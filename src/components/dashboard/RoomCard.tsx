import { MapPin, IndianRupee, Users, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RoomCardProps {
  room: {
    id: string;
    images: string[];
    title: string;
    rent: number;
    location: string;
    roomType: string;
    availableFrom: string;
    amenities: string[];
    description: string;
    preferredTenant: string;
  };
}

export const RoomCard = ({ room }: RoomCardProps) => {
  return (
    <div className="h-full flex flex-col">
      {/* Image Gallery */}
      <div className="relative h-[60%] md:h-[70%]">
        <img
          src={room.images[0]}
          alt={room.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Quick Info Overlay - Mobile */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 p-4 text-white">
          <h2 className="text-2xl font-bold mb-2">{room.title}</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <IndianRupee className="h-4 w-4" />
              <span className="font-semibold">₹{room.rent.toLocaleString('en-IN')}/mo</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{room.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="flex-1 p-6 overflow-y-auto bg-card">
        {/* Desktop Header */}
        <div className="hidden md:block mb-4">
          <h2 className="text-3xl font-bold mb-2">{room.title}</h2>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <IndianRupee className="h-5 w-5" />
              <span className="text-xl font-semibold text-primary">₹{room.rent.toLocaleString('en-IN')}/mo</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-5 w-5" />
              <span>{room.location}</span>
            </div>
          </div>
        </div>

        {/* Room Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm md:text-base">
            <Home className="h-5 w-5 text-primary" />
            <span className="font-medium">Room Type:</span>
            <span className="text-muted-foreground">{room.roomType}</span>
          </div>

          <div className="flex items-center gap-2 text-sm md:text-base">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-medium">Looking for:</span>
            <span className="text-muted-foreground">{room.preferredTenant}</span>
          </div>

          <div>
            <p className="font-medium mb-2">Available from:</p>
            <p className="text-muted-foreground">{room.availableFrom}</p>
          </div>

          <div>
            <p className="font-medium mb-2">Amenities:</p>
            <div className="flex flex-wrap gap-2">
              {room.amenities.map((amenity, index) => (
                <Badge key={index} variant="secondary">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="font-medium mb-2">Description:</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {room.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
