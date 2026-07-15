import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description: "The page you are looking for could not be found.",
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Navbar />

      {/* Glow orbs */}
      <div
        className="pointer-events-none fixed left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#38bdf8]/8 blur-[140px] mun-glow"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed left-1/4 top-2/3 h-[300px] w-[300px] rounded-full bg-[#38bdf8]/5 blur-[100px]"
        aria-hidden
      />

      <section className="flex-1 flex flex-col items-center justify-center px-4 py-32 relative">

        {/* Ghost watermark */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden select-none pointer-events-none">
          <span
            className="font-heading font-bold text-white/[0.018] tracking-tighter"
            style={{ fontSize: "clamp(8rem, 30vw, 22rem)" }}
            aria-hidden
          >
            404
          </span>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-block border border-[#38bdf8]/30 text-[#38bdf8] text-[10px] font-heading tracking-[0.2em] px-3 py-1 rounded-sm mb-8">
            ERROR 404
          </div>

          {/* Big 404 */}
          <div
            className="font-display text-[#38bdf8] leading-none mb-6 select-none"
            style={{
              fontSize: "clamp(5rem, 18vw, 13rem)",
              letterSpacing: "0.04em",
              textShadow: "0 0 60px rgba(56,189,248,0.35), 0 0 120px rgba(56,189,248,0.15)",
            }}
          >
            404
          </div>

          {/* Divider line */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#38bdf8]/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]/60 shadow-[0_0_8px_#38bdf8]" />
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#38bdf8]/40" />
          </div>

          <h1
            className="font-display text-white mb-4"
            style={{
              fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)",
              letterSpacing: "0.06em",
            }}
          >
            PAGE NOT FOUND
          </h1>

          <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto mb-12">
            The page you are looking for has either been moved, removed, or
            never existed. Perhaps the committee guidebook will help instead.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="bg-[#38bdf8] text-black font-heading font-bold text-xs tracking-widest px-8 py-3.5 rounded hover:bg-white transition-all duration-300 shadow-xl shadow-[#38bdf8]/20"
            >
              BACK TO HOME
            </Link>
            <Link
              href="/committees"
              className="border border-white/20 text-white/80 font-heading font-bold text-xs tracking-widest px-8 py-3.5 rounded hover:border-[#38bdf8]/60 hover:text-[#38bdf8] transition-all duration-300"
            >
              VIEW COMMITTEES
            </Link>
          </div>

          {/* Quick nav */}
          <div className="mt-16 pt-8 border-t border-white/5">
            <p className="text-white/25 text-[10px] font-heading tracking-[0.2em] mb-5 uppercase">
              Quick Navigation
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { href: "/about", label: "About Us" },
                { href: "/committees", label: "Committees" },
                { href: "/contact", label: "Contact Us" },
                { href: "/privacy-policy", label: "Privacy Policy" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-white/40 hover:text-[#38bdf8] text-xs font-heading tracking-widest transition-colors duration-200"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
