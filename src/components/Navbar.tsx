import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Home, Menu, Sun, Moon, LayoutDashboard, UserCircle, List, LogOut, LogIn, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleListYourRoom = () => {
    if (isAuthenticated) {
      navigate('/create-listing');
    } else {
      // Navigate to login, potentially with a redirect param if supported by the auth flow
      // For now, just login, user can navigate back. 
      // Ideally: navigate('/auth/login?redirect=/create-listing');
      navigate('/auth/login');
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
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
              Roomiecircle
            </span>
          </div>

          {/* Centered Toggle - Desktop & Mobile */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-muted/30 backdrop-blur-md p-1 rounded-full border border-border/30 shadow-sm">
            <button
              onClick={() => navigate("/")}
              className={`relative px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ease-out ${window.location.pathname === "/"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {window.location.pathname === "/" && (
                <span className="absolute inset-0 bg-background rounded-full shadow-md -z-10 animate-scale-in" />
              )}
              <span className="relative z-10">Rooms</span>
            </button>
            <button
              onClick={() => navigate("/roommates")}
              className={`relative px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ease-out ${window.location.pathname === "/roommates"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {window.location.pathname === "/roommates" && (
                <span className="absolute inset-0 bg-background rounded-full shadow-md -z-10 animate-scale-in" />
              )}
              <span className="relative z-10 flex flex-col items-center leading-none">
                <span className="text-sm">Roommates</span>
                <span className="text-[8px] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold animate-pulse mt-0.5">
                  Coming Soon
                </span>
              </span>
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Desktop: List Room CTA */}
            <Button
              onClick={handleListYourRoom}
              className="hidden md:flex bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-white border-0"
              size="sm"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              List Room
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden md:flex"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Desktop: User Menu or Sign In */}
            <div className="hidden md:block">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={user?.profilePicture || undefined} alt={user?.name} />
                        <AvatarFallback>{getInitials(user?.name || 'User')}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>

                    <DropdownMenuItem onClick={() => navigate('/?tab=profile')}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/my-listings')}>
                      <List className="mr-2 h-4 w-4" />
                      <span>My Listings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" onClick={() => navigate('/auth/login')}>
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader className="text-left border-b pb-4 mb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Home className="h-4 w-4 text-white" />
                    </div>
                    Roomiecircle
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-4">
                  {isAuthenticated && (
                    <div className="flex items-center gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
                      <Avatar>
                        <AvatarImage src={user?.profilePicture || undefined} />
                        <AvatarFallback>{getInitials(user?.name || 'User')}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{user?.name}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="default"
                      className="w-full justify-start bg-gradient-to-r from-primary to-secondary text-white"
                      onClick={() => {
                        handleListYourRoom();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      List Room
                    </Button>

                    {isAuthenticated ? (
                      <>

                        <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/?tab=profile'); setMobileMenuOpen(false); }}>
                          <UserCircle className="mr-2 h-4 w-4" />
                          Profile
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/my-listings'); setMobileMenuOpen(false); }}>
                          <List className="mr-2 h-4 w-4" />
                          My Listings
                        </Button>
                        <div className="my-2 border-t" />
                        <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="my-2 border-t" />
                        <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/auth/login'); setMobileMenuOpen(false); }}>
                          <LogIn className="mr-2 h-4 w-4" />
                          Sign In
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
