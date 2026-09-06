import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Reveal } from "@/components/motion";
import YpmClient from "@/components/committees/ypm-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Youth Parliament (YPM) Registration",
  description:
    "Youth Parliament (YPM) Registration & Payment Portal by MUNSoC NITJ.",
};

export default function YpmPage() {
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
            className="font-poster text-white/[0.025] whitespace-nowrap"
            style={{
              fontSize: "clamp(6rem, 22vw, 16rem)",
              letterSpacing: "0.02em",
              lineHeight: "0.8",
              transform: "scaleY(1.4)",
              display: "inline-block",
            }}
            aria-hidden
          >
            YOUTH PARLIAMENT
          </span>
        </div>
        <Reveal className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-block border border-[#38bdf8]/30 text-[#38bdf8] text-[10px] font-heading tracking-[0.2em] px-3 py-1 rounded-sm mb-5 uppercase">
            PARLIAMENTARY COMMITTEE &bull; 10 OCTOBER 2026
          </div>
          <h1
            className="font-poster text-white uppercase leading-[0.85] text-center"
            style={{
              fontSize: "clamp(3.0rem, 8vw, 6rem)",
              letterSpacing: "0.02em",
              transform: "scaleY(1.4)",
            }}
          >
            YOUTH PARLIAMENT
          </h1>
          <p className="mt-5 text-[#38bdf8] font-heading font-semibold text-xs sm:text-sm tracking-[0.15em] uppercase mb-4">
            All India Political Parties Meet (AIPPM)
          </p>
        </Reveal>
      </section>

      {/* Main Form and Content Client Section */}
      <YpmClient />

      <Footer />
    </main>
  );
}
