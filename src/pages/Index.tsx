import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RoomsResults } from "@/components/search/RoomsResults";
import { RoommatesResults } from "@/components/search/RoommatesResults";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"rooms" | "roommates">("rooms");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1">
        {activeTab === "rooms" ? <RoomsResults /> : <RoommatesResults />}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
