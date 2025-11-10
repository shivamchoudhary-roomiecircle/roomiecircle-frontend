import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RoomsResults } from "@/components/search/RoomsResults";
import { RoommatesResults } from "@/components/search/RoommatesResults";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"rooms" | "roommates">("rooms");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Tab Navigation */}
      <div className="border-b border-border bg-background sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("rooms")}
              className={`rounded-none border-b-2 transition-colors h-14 ${
                activeTab === "rooms"
                  ? "border-primary text-foreground font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Rooms
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("roommates")}
              className={`rounded-none border-b-2 transition-colors h-14 ${
                activeTab === "roommates"
                  ? "border-primary text-foreground font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Roommates
            </Button>
          </div>
        </div>
      </div>

      <main className="flex-1">
        {activeTab === "rooms" ? <RoomsResults /> : <RoommatesResults />}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
