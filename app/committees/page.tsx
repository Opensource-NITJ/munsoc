import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CommitteesGrid from "@/components/committees/committees-grid";
import type { Metadata } from "next";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "Committees",
  description:
    "Discover the upcoming committees at MUNSoC NITJ conferences. Guidebooks and agendas will be released soon.",
  alternates: {
    canonical: "https://munsoc.opensourcenitj.com/committees",
  },
};

export default function CommitteesPage() {
  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <Navbar />

      <section className="relative pt-32 pb-16 px-4 bg-[#0a0a0a] overflow-hidden">
        <div
          className="pointer-events-none absolute left-1/2 top-20 -translate-x-1/2 h-[300px] w-[500px] rounded-full bg-[#38bdf8]/8 blur-[120px] mun-glow"
          aria-hidden
        />
        <Reveal className="relative max-w-3xl mx-auto text-center">
          <div className="inline-block border border-[#38bdf8]/30 text-[#38bdf8] text-[10px] font-heading tracking-[0.2em] px-3 py-1 rounded-sm mb-5">
            ANNOUNCING COMMITTEES SOON
          </div>
          <h1
            className="font-display text-white text-balance"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              letterSpacing: "0.04em",
            }}
          >
            COMMITTEES &amp; AGENDA
          </h1>
          <p className="mt-4 text-white/70 text-sm leading-relaxed max-w-xl mx-auto text-pretty">
            Our upcoming conference will feature carefully curated committees
            designed to challenge delegates with complex, real-world global
            issues. Guidebooks will be released before the conference.
          </p>
        </Reveal>
      </section>

      <CommitteesGrid />

      <section className="pb-24 px-4 bg-[#121212]">
        <div className="max-w-5xl mx-auto">
          <Reveal className="bg-gradient-to-br from-[#1c1c1e] to-[#0a0a0a] border border-white/10 rounded-2xl p-8 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#38bdf8]/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
            
            <div className="relative flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-block border border-[#38bdf8]/30 text-[#38bdf8] text-[10px] font-heading tracking-[0.2em] px-3 py-1 rounded-sm mb-5">
                  ESSENTIAL RESOURCE
                </div>
                <h2 className="font-display text-white text-3xl md:text-4xl mb-4 tracking-wider">
                  THE MUN GUIDEBOOK: <span className="text-[#38bdf8]">MUN 101</span>
                </h2>
                <p className="text-white/60 text-sm md:text-base leading-relaxed mb-8 max-w-2xl">
                  New to Model United Nations? Our comprehensive MUN 101 Guidebook covers everything 
                  from rules of procedure and position papers to public speaking tips and caucus 
                  strategies. Master the art of diplomacy before you step onto the floor.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <a 
                    href="/guidebook.pdf" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-black font-heading font-bold text-xs tracking-widest px-8 py-3.5 rounded hover:bg-[#38bdf8] hover:text-black transition-all duration-300 shadow-xl shadow-white/5"
                  >
                    DOWNLOAD GUIDEBOOK
                  </a>
                </div>
              </div>
              <div className="w-full md:w-1/3 aspect-[3/4] bg-[#121212] border border-white/10 rounded-xl flex items-center justify-center p-8 group-hover:border-[#38bdf8]/20 transition-colors duration-500">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#38bdf8]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.168.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="text-white font-heading text-sm tracking-widest font-bold">MUN 101</p>
                  <p className="text-white/55 text-[10px] mt-1 uppercase">Official Publication</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
