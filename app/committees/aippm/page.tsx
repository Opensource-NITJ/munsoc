import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Reveal } from "@/components/motion";
import AippmClient from "@/components/committees/aippm-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AIPPM Committee",
  description: "All India Political Parties Meet (AIPPM) by MUNSoC NITJ.",
};

export default function AippmPage() {
  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-36 pb-16 px-4 bg-[#0a0a0a] overflow-hidden">
        <div
          className="pointer-events-none absolute left-1/2 top-20 -translate-x-1/2 h-[300px] w-[500px] rounded-full bg-[#38bdf8]/8 blur-[120px] mun-glow"
          aria-hidden
        />
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden">
          <span
            className="font-heading font-bold text-white/[0.025] tracking-tighter whitespace-nowrap"
            style={{ fontSize: "clamp(5rem, 18vw, 13rem)" }}
            aria-hidden
          >
            AIPPM
          </span>
        </div>
        <Reveal className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-block border border-[#38bdf8]/30 text-[#38bdf8] text-[10px] font-heading tracking-[0.2em] px-3 py-1 rounded-sm mb-5 uppercase">
            ONLINE MUN COMMITTEE &bull; 16 JULY 9AM
          </div>
          <h1
            className="font-display text-white text-balance uppercase"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              letterSpacing: "0.04em",
            }}
          >
            AIPPM
          </h1>
          <p className="mt-4 text-[#38bdf8] font-heading font-semibold text-xs sm:text-sm tracking-[0.15em] uppercase mb-4">
            All India Political Parties Meet
          </p>
          <p className="text-white/60 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto text-pretty">
            Simulating Indian political debates and policy negotiations under the patronage of Model United Nations Society, NIT Jalandhar.
          </p>
        </Reveal>
      </section>

      {/* Main Form and Content Client Section */}
      <AippmClient />

      <Footer />
    </main>
  );
}
