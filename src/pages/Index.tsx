import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SearchSection from "@/components/SearchSection";
import PostRoomSection from "@/components/PostRoomSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <SearchSection />
        <PostRoomSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
