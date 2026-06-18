import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import HistoryVision from "@/components/about/history-vision";
import OrganizingCommittee from "@/components/about/organizing-committee";
import CommitteeMembers from "@/components/about/committee-members";
import { Reveal } from "@/components/motion";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about the history, vision, and team behind MUNSoC NITJ - the Model United Nations Society at NIT Jalandhar.",
  alternates: {
    canonical: "https://munsoc.opensourcenitj.com/about",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <Navbar />

      <section className="relative pt-32 pb-20 px-4 bg-[#0a0a0a] overflow-hidden">
        
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden">
          <span
            className="font-heading font-bold text-white/[0.03] tracking-tighter whitespace-nowrap"
            style={{ fontSize: "clamp(5rem, 20vw, 14rem)" }}
            aria-hidden
          >
            MUN
          </span>
        </div>
        <Reveal className="relative z-10 max-w-2xl mx-auto text-center">
          <h1
            className="font-display text-white text-balance"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              letterSpacing: "0.04em",
            }}
          >
            ABOUT MUNSOC NITJ
          </h1>
          <p className="mt-4 text-white/70 text-sm leading-relaxed text-pretty max-w-lg mx-auto">
            Fostering diplomacy, intellectual discourse, and global leadership
            among the brightest minds at Dr. B.R. Ambedkar National Institute of
            Technology.
          </p>
        </Reveal>
      </section>

      <HistoryVision />
      <OrganizingCommittee />
      <CommitteeMembers />
      <Footer />
    </main>
  );
}
