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
      
      <div className="fixed top-14 left-0 right-0 z-40 bg-[#1c3a4a]/80 backdrop-blur-md border-b border-[#38bdf8]/20 py-2.5 overflow-hidden">
        <div className="flex whitespace-nowrap animate-mun-marquee hover:[animation-play-state:paused] cursor-default">
          
          <div className="flex items-center">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex items-center">
                <p className="text-[#38bdf8] text-[10px] font-heading tracking-[0.2em] flex items-center gap-3 px-12">
                  <span className="w-1 h-1 bg-[#38bdf8] rounded-full shadow-[0_0_8px_#38bdf8]" />
                  <a href="/committees/aippm" className="hover:text-white transition-colors uppercase">
                    ONLINE MUN (AIPPM) ON 16 JULY 9AM
                  </a>
                </p>
                <div className="h-3 w-[1px] bg-[#38bdf8]/20" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pt-8">
        <HeroSection />
        <MissionSection />
        <CommitteesSection />
        <CTASection />
      </div>
      <Footer />
    </main>
  );
}
