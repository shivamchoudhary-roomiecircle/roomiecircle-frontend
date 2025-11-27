
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { RoomsResults } from "@/components/search/RoomsResults";


const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <RoomsResults />
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;
