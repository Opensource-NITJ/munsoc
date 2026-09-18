import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import HeroSection from "@/components/home/hero-section";
import MissionSection from "@/components/home/mission-section";
import CommitteesSection from "@/components/home/committees-section";
import CTASection from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <Navbar />

      <HeroSection />
      <MissionSection />
      <CommitteesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
