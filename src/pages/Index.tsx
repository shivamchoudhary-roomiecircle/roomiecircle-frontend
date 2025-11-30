import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { RoomsResults } from "@/components/search/RoomsResults";
import Profile from "./Profile";
import SEO from "@/components/SEO";


const Index = () => {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab");

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Find Rooms & Roommates | India's Trusted Community"
        description="Find compatible roommates and safe, affordable rooms across India. Verified profiles, zero brokerage, smart lifestyle matching for students and professionals."
        keywords={['roommates', 'rooms', 'flatmates', 'shared accommodation', 'india', 'no brokerage']}
      />
      <Navbar />

      <main className="flex-1">
        {currentTab === "profile" ? (
          <Profile />
        ) : (
          <RoomsResults />
        )}
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;
