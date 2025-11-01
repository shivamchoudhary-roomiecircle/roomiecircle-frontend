import { Button } from "@/components/ui/button";
import { Home as HomeIcon, Menu, User, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleProtectedAction = (path: string) => {
    if (!isAuthenticated) {
      navigate('/auth/login');
    } else {
      navigate(path);
    }
  };

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
            <button 
              onClick={() => handleProtectedAction('/#search-section')}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Find Rooms
            </button>
            <button 
              onClick={() => handleProtectedAction('/#search-section')}
              className="text-foreground hover:text-secondary transition-colors font-medium"
            >
              Find Roommates
            </button>
            <Button variant="outline" onClick={() => handleProtectedAction('/post-room')}>
              List Your Room
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                  <User className="h-4 w-4 mr-2" />
                  {user?.name}
                </Button>
                <Button variant="outline" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button variant="default" onClick={() => navigate('/auth/login')}>
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button, Theme Toggle, and Auth */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            {isAuthenticated ? (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/dashboard')}
              >
                <User className="h-5 w-5" />
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => navigate('/auth/login')}
              >
                Sign In
              </Button>
            )}
            <button 
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-border">
            <button 
              onClick={() => {
                handleProtectedAction('/#search-section');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors font-medium"
            >
              Find Rooms
            </button>
            <button 
              onClick={() => {
                handleProtectedAction('/#search-section');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-foreground hover:text-secondary transition-colors font-medium"
            >
              Find Roommates
            </button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                handleProtectedAction('/post-room');
                setMobileMenuOpen(false);
              }}
            >
              List Your Room
            </Button>
            {isAuthenticated && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
              >
                Logout
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
