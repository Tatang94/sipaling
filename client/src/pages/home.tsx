import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import PopularCities from "@/components/popular-cities";
import FeaturedKos from "@/components/featured-kos";
import PromotionalSection from "@/components/promotional-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <HeroSection />
      <PopularCities />
      <FeaturedKos />
      <PromotionalSection />
      <Footer />
    </div>
  );
}
