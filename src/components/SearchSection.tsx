import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import RoomSearch from "./RoomSearch";
import RoommateSearch from "./RoommateSearch";
import { Home, Users } from "lucide-react";

const SearchSection = () => {
  const [activeTab, setActiveTab] = useState("rooms");

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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 h-14">
                <TabsTrigger 
                  value="rooms" 
                  className="text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Home className="mr-2 h-5 w-5" />
                  Find Rooms
                </TabsTrigger>
                <TabsTrigger 
                  value="roommates"
                  className="text-base data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Find Roommates
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="rooms" className="mt-0">
                <RoomSearch />
              </TabsContent>
              
              <TabsContent value="roommates" className="mt-0">
                <RoommateSearch />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
