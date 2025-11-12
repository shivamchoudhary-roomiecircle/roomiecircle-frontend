import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Home, Menu, User, Sun, Moon, LayoutDashboard, UserCircle, List, LogOut, LogIn } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
interface NavbarProps {
  activeTab?: "rooms" | "roommates";
  onTabChange?: (tab: "rooms" | "roommates") => void;
}

const Navbar = ({ activeTab, onTabChange }: NavbarProps) => {
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
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="hidden lg:inline text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              RoomieCircle
            </span>
          </div>

          {/* Centered Toggle - Desktop & Mobile */}
          {onTabChange && (
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-muted/30 backdrop-blur-md p-1 rounded-full border border-border/30 shadow-sm">
              <button 
                onClick={() => onTabChange("rooms")}
                className={`relative px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ease-out ${
                  activeTab === "rooms" 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === "rooms" && (
                  <span className="absolute inset-0 bg-background rounded-full shadow-md -z-10 animate-scale-in" />
                )}
                <span className="relative z-10">Rooms</span>
              </button>
              <button 
                onClick={() => onTabChange("roommates")}
                className={`relative px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ease-out ${
                  activeTab === "roommates" 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === "roommates" && (
                  <span className="absolute inset-0 bg-background rounded-full shadow-md -z-10 animate-scale-in" />
                )}
                <span className="relative z-10">Roommates</span>
              </button>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-3">
            <Button variant="outline" onClick={() => handleProtectedAction('/create-listing')}>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <User className="h-4 w-4 mr-2" />
                    {user?.name}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard?tab=profile')}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard?tab=listings')}>View Listings</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard?tab=status')}>Listing Status</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleProtectedAction('/create-listing')}>List Your Room</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" onClick={() => navigate('/auth/login')}>
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile & Tablet Menu Button and Theme Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <button 
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Menu */}
        {mobileMenuOpen && (
          <>
            {createPortal(
              <>
                {/* Full-screen click catcher */}
                <div
                  className="fixed inset-0 z-[998] bg-transparent"
                  onClick={() => setMobileMenuOpen(false)}
                />

                {/* Floating Menu */}
                <div className="fixed top-20 right-4 w-64 bg-background/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl z-[999] py-3 animate-scale-in">
                  {!isAuthenticated && (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start px-4 hover:bg-primary/10 transition-colors"
                      onClick={() => {
                        navigate('/auth/login');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogIn className="h-4 w-4 mr-3" />
                      Sign In
                    </Button>
                  )}
                  {isAuthenticated && (
                    <>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start px-4 hover:bg-primary/10 transition-colors"
                        onClick={() => {
                          navigate('/dashboard');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-3" />
                        Dashboard
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start px-4 hover:bg-primary/10 transition-colors"
                        onClick={() => {
                          navigate('/dashboard?tab=profile');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <UserCircle className="h-4 w-4 mr-3" />
                        Profile
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start px-4 hover:bg-primary/10 transition-colors"
                        onClick={() => {
                          navigate('/dashboard?tab=listings');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <List className="h-4 w-4 mr-3" />
                        View Listings
                      </Button>
                      <div className="my-2 border-t border-primary/10" />
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start px-4 hover:bg-primary/10 transition-colors"
                        onClick={() => {
                          navigate('/create-listing');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Home className="h-4 w-4 mr-3" />
                        List Your Room
                      </Button>
                      <div className="my-2 border-t border-primary/10" />
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start px-4 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </Button>
                    </>
                  )}
                </div>
              </>,
              document.body
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
