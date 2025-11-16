import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, LogOut, Plus } from 'lucide-react';
import ListingCard from '@/components/dashboard/ListingCard';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface Listing {
  id: string;
  monthlyRent: number;
  address: string;
  hasBrokerage: boolean;
  photos: string[];
  lister: {
    id: number;
    name: string;
    profilePicture: string | null;
    verified: boolean;
    verificationLevel: string | null;
    profileScore: number | null;
  };
  roomType: string;
  bhkType: string;
  layoutType: string | null;
  layoutTypeKey: string | null;
  propertyTypes: string[];
  propertyTypeKeys: string[];
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getMyListings();
      // Combine active and inactive listings
      const allListings = [...(response.active || []), ...(response.inactive || [])];
      setListings(allListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout. Please try again.');
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/create-listing?id=${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteRoomListing(id);
      toast.success('Listing deleted successfully');
      fetchListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await apiClient.updateListingStatus(id, newStatus);
      toast.success(`Listing ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
      fetchListings();
    } catch (error) {
      console.error('Error updating listing status:', error);
      toast.error('Failed to update listing status');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <HomeIcon className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">RoomieCircle</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/create-listing')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Listing
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Message */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Listings</h1>
            <p className="text-muted-foreground">
              Manage your room listings and track their performance
            </p>
          </div>

          {/* Listings Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading listings...</p>
            </div>
          ) : listings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                You don't have any listings yet
              </p>
              <Button onClick={() => navigate('/create-listing')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Listing
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
