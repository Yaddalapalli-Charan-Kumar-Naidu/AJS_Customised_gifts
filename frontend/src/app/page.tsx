import CinematicLoader from "@/components/layout/CinematicLoader";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import FeaturedCarousel from "@/components/sections/FeaturedCarousel";
import CategoriesSection from "@/components/sections/CategoriesSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import InstagramGallery from "@/components/sections/InstagramGallery";
import FAQSection from "@/components/sections/FAQSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-cream selection:bg-pink-200 selection:text-pink-900 overflow-hidden">
      <CinematicLoader />
      <Navbar />
      
      <HeroSection />
      
      {/* Featured Products */}
      <FeaturedCarousel 
        title="Featured Gifts" 
        subtitle="Hand-picked premium selections for your loved ones" 
        filterKey="isFeatured" 
        filterValue="true" 
        emoji="✨" 
      />

      <CategoriesSection />

      {/* Trending Products */}
      <div className="bg-white/50 py-10">
        <FeaturedCarousel 
          title="Trending Now" 
          subtitle="What everyone is loving right now" 
          filterKey="isTrending" 
          filterValue="true" 
          emoji="🔥" 
        />
      </div>

      {/* Best Sellers */}
      <FeaturedCarousel 
        title="Best Sellers" 
        subtitle="Our most loved and gifted items" 
        filterKey="isBestSeller" 
        filterValue="true" 
        emoji="👑" 
      />

      <TestimonialsSection />
      
      <InstagramGallery />
      
      <FAQSection />

      <Footer />
    </main>
  );
}
