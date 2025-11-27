
import { Card } from "@/components/ui/card";
import RoomSearch from "./RoomSearch";
import { Home, Users } from "lucide-react";

const SearchSection = () => {


  return (
    <section id="search-section" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start Your Search
            </h2>
            <p className="text-lg text-muted-foreground">
              Find exactly what you're looking for with our smart filters
            </p>
          </div>

          {/* Search Tabs */}
          <Card className="p-6 shadow-card">
            <div className="w-full">
              <div className="grid w-full grid-cols-2 mb-8 h-14 bg-muted rounded-lg p-1">
                <button
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background text-foreground shadow"
                >
                  <Home className="mr-2 h-5 w-5" />
                  Find Rooms
                </button>
                <button
                  onClick={() => window.location.href = '/roommates'}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-background/50 hover:text-foreground"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Find Roommates (Coming Soon)
                </button>
              </div>

              <div className="mt-0">
                <RoomSearch />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
