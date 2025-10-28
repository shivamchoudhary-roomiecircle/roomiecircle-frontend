import { Button } from "@/components/ui/button";
import { Search, Users, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleFindClick = () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
    } else {
      document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Happy roommates in a shared living space" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/75" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-foreground">India's Most Trusted Community</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Find Your Perfect
            <span className="block mt-2 bg-gradient-to-r from-primary via-[hsl(25_90%_65%)] to-secondary bg-clip-text text-transparent">
              Room & Roommate
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Connect with verified students and professionals. Discover compatible roommates and safe, affordable rooms across India.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              variant="hero"
              className="text-lg px-8 py-6 h-auto group"
              onClick={handleFindClick}
            >
              <Search className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Find Rooms
            </Button>
            <Button 
              size="lg" 
              variant="trust"
              className="text-lg px-8 py-6 h-auto group"
              onClick={handleFindClick}
            >
              <Users className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Find Roommates
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                <Users className="h-4 w-4 text-secondary" />
              </div>
              <span>Verified Profiles</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Home className="h-4 w-4 text-primary" />
              </div>
              <span>Zero Brokerage</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <Search className="h-4 w-4 text-accent" />
              </div>
              <span>Smart Matching</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700" />
    </section>
  );
};

export default Hero;
