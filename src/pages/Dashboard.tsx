import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <nav className="border-b border-border bg-background/80 backdrop-blur-lg">
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
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg mb-8">
            <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}!</h1>
            <p className="text-muted-foreground">
              This is your dashboard. More features coming soon!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-bold mb-2">Your Profile</h2>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Email:</span> {user?.email}</p>
                <p><span className="text-muted-foreground">Name:</span> {user?.name}</p>
                <p><span className="text-muted-foreground">Verified:</span> {user?.isVerified ? '✓ Yes' : '✗ No'}</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-bold mb-2">Quick Actions</h2>
              <div className="space-y-3">
                <Button className="w-full" onClick={() => navigate('/')}>
                  Browse Rooms
                </Button>
                <Button className="w-full" variant="outline" onClick={() => navigate('/post-room')}>
                  List Your Room
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
