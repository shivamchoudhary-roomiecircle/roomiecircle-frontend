import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, LogOut, RotateCcw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SwipeCard } from '@/components/dashboard/SwipeCard';
import { RoomCard } from '@/components/dashboard/RoomCard';
import { RoommateCard } from '@/components/dashboard/RoommateCard';
import { toast } from 'sonner';

// Mock data - replace with API calls later
const mockRooms = [
  {
    id: '1',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
    title: 'Cozy Studio in Downtown',
    rent: 1200,
    location: 'Manhattan, NY',
    roomType: 'Private Room',
    availableFrom: 'Jan 1, 2025',
    amenities: ['WiFi', 'AC', 'Kitchen', 'Washer'],
    description: 'Beautiful studio apartment in the heart of downtown. Close to subway, restaurants, and entertainment. Perfect for young professionals.',
    preferredTenant: 'Working Professional',
  },
  {
    id: '2',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'],
    title: 'Spacious Room with View',
    rent: 950,
    location: 'Brooklyn, NY',
    roomType: 'Shared Room',
    availableFrom: 'Dec 15, 2024',
    amenities: ['WiFi', 'Gym', 'Parking', 'Pet Friendly'],
    description: 'Large room in a modern apartment with stunning city views. Great community vibe with friendly roommates.',
    preferredTenant: 'Student or Professional',
  },
  {
    id: '3',
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'],
    title: 'Modern Loft Space',
    rent: 1500,
    location: 'Queens, NY',
    roomType: 'Private Room',
    availableFrom: 'Jan 15, 2025',
    amenities: ['WiFi', 'AC', 'Dishwasher', 'Balcony'],
    description: 'Contemporary loft with high ceilings and natural light. Quiet neighborhood with easy access to public transport.',
    preferredTenant: 'Any',
  },
];

const mockRoommates = [
  {
    id: '1',
    name: 'Sarah',
    age: 25,
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
    occupation: 'Software Engineer',
    location: 'Manhattan, NY',
    budget: '$800 - $1200/mo',
    moveInDate: 'January 2025',
    bio: 'Clean, respectful, and easy-going. I work from home 2-3 days a week and enjoy cooking and yoga in my free time.',
    interests: ['Yoga', 'Cooking', 'Reading', 'Coffee'],
    lifestyle: ['Non-smoker', 'No pets', 'Early bird'],
  },
  {
    id: '2',
    name: 'Mike',
    age: 28,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    occupation: 'Graphic Designer',
    location: 'Brooklyn, NY',
    budget: '$900 - $1400/mo',
    moveInDate: 'December 2024',
    bio: 'Friendly and social but respect privacy. Love hosting game nights and exploring the city on weekends.',
    interests: ['Gaming', 'Music', 'Photography', 'Hiking'],
    lifestyle: ['Social drinker', 'Cat owner', 'Night owl'],
  },
  {
    id: '3',
    name: 'Jessica',
    age: 23,
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80',
    occupation: 'Marketing Manager',
    location: 'Queens, NY',
    budget: '$700 - $1000/mo',
    moveInDate: 'February 2025',
    bio: 'Graduate student looking for a quiet place to focus on studies. Clean and organized.',
    interests: ['Reading', 'Coffee', 'Movies', 'Running'],
    lifestyle: ['Non-smoker', 'Quiet', 'Plant parent'],
  },
];

type CardType = typeof mockRooms[0] | typeof mockRoommates[0];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'rooms' | 'roommates'>('rooms');
  const [currentRooms, setCurrentRooms] = useState(mockRooms);
  const [currentRoommates, setCurrentRoommates] = useState(mockRoommates);

  const currentCards = mode === 'rooms' ? currentRooms : currentRoommates;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSwipe = (direction: string, id: string) => {
    if (direction === 'right') {
      toast.success('Added to favorites!');
    }
    if (mode === 'rooms') {
      setCurrentRooms(prev => prev.filter(card => card.id !== id));
    } else {
      setCurrentRoommates(prev => prev.filter(card => card.id !== id));
    }
  };

  const handleReset = () => {
    if (mode === 'rooms') {
      setCurrentRooms(mockRooms);
    } else {
      setCurrentRoommates(mockRoommates);
    }
    toast.info('Cards reset!');
  };

  const handleModeChange = (value: string) => {
    setMode(value as 'rooms' | 'roommates');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <nav className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                <HomeIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                RoomieCircle
              </span>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <Tabs value={mode} onValueChange={handleModeChange} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="rooms" className="text-base font-medium">
                Find Rooms
              </TabsTrigger>
              <TabsTrigger value="roommates" className="text-base font-medium">
                Find Roommates
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Swipe Cards Container */}
        <div className="max-w-2xl mx-auto">
          <div className="relative h-[70vh] md:h-[75vh]">
            {currentCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full bg-card rounded-2xl border border-border p-8">
                <p className="text-2xl font-semibold mb-4">No more {mode} to show</p>
                <Button onClick={handleReset} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset Cards
                </Button>
              </div>
            ) : (
              currentCards.map((card, index) => (
                <SwipeCard
                  key={card.id}
                  id={card.id}
                  onSwipe={(direction) => handleSwipe(direction, card.id)}
                  className={`z-[${currentCards.length - index}]`}
                >
                  {mode === 'rooms' ? (
                    <RoomCard room={card as any} />
                  ) : (
                    <RoommateCard roommate={card as any} />
                  )}
                </SwipeCard>
              ))
            )}
          </div>

          {/* Swipe Instructions - Mobile */}
          {currentCards.length > 0 && (
            <div className="md:hidden text-center mt-4 text-sm text-muted-foreground">
              <p>Swipe right to like • Swipe left to pass</p>
              <p className="mt-1">Tap card to see more details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
