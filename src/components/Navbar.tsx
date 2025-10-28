import { Button } from "@/components/ui/button";
import { Home as HomeIcon, Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#search-section" className="text-foreground hover:text-primary transition-colors font-medium">
              Find Rooms
            </a>
            <a href="#search-section" className="text-foreground hover:text-secondary transition-colors font-medium">
              Find Roommates
            </a>
            <Button variant="outline" onClick={() => navigate('/post-room')}>
              List Your Room
            </Button>
            <Button variant="default">
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-border">
            <a 
              href="#search-section" 
              className="block py-2 text-foreground hover:text-primary transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Rooms
            </a>
            <a 
              href="#search-section" 
              className="block py-2 text-foreground hover:text-secondary transition-colors font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Roommates
            </a>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                navigate('/post-room');
                setMobileMenuOpen(false);
              }}
            >
              List Your Room
            </Button>
            <Button variant="default" className="w-full">
              Sign In
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
