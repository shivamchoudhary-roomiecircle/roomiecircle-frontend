import { MapPin, Briefcase, Calendar, Music, Coffee, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface RoommateCardProps {
  roommate: {
    id: string;
    name: string;
    age: number;
    photo: string;
    occupation: string;
    location: string;
    budget: string;
    moveInDate: string;
    bio: string;
    interests: string[];
    lifestyle: string[];
  };
}

export const RoommateCard = ({ roommate }: RoommateCardProps) => {
  return (
    <div className="h-full flex flex-col">
      {/* Profile Photo */}
      <div className="relative h-[60%] md:h-[70%]">
        <img
          src={roommate.photo}
          alt={roommate.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Quick Info Overlay - Mobile */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 p-4 text-white">
          <h2 className="text-2xl font-bold mb-1">{roommate.name}, {roommate.age}</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span>{roommate.occupation}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{roommate.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="flex-1 p-6 overflow-y-auto bg-card">
        {/* Desktop Header */}
        <div className="hidden md:block mb-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={roommate.photo} />
              <AvatarFallback>{roommate.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-bold">{roommate.name}, {roommate.age}</h2>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{roommate.occupation}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{roommate.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roommate Details */}
        <div className="space-y-4">
          <div>
            <p className="font-medium mb-2">Budget:</p>
            <p className="text-primary font-semibold">{roommate.budget}</p>
          </div>

          <div className="flex items-center gap-2 text-sm md:text-base">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-medium">Move-in date:</span>
            <span className="text-muted-foreground">{roommate.moveInDate}</span>
          </div>

          <div>
            <p className="font-medium mb-2">About:</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {roommate.bio}
            </p>
          </div>

          <div>
            <p className="font-medium mb-2">Interests:</p>
            <div className="flex flex-wrap gap-2">
              {roommate.interests.map((interest, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {interest === 'Music' && <Music className="h-3 w-3" />}
                  {interest === 'Coffee' && <Coffee className="h-3 w-3" />}
                  {interest === 'Reading' && <BookOpen className="h-3 w-3" />}
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="font-medium mb-2">Lifestyle:</p>
            <div className="flex flex-wrap gap-2">
              {roommate.lifestyle.map((trait, index) => (
                <Badge key={index} variant="outline">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
