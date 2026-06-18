"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Reveal } from "@/components/motion";

export default function CTASection() {
  return (
    <section className="relative bg-[#121212] py-28 px-4 overflow-hidden">
      <div
        className="pointer-events-none absolute left-1/2 bottom-0 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-[#38bdf8]/8 blur-[120px] mun-glow"
        aria-hidden
      />
      <div className="relative max-w-2xl mx-auto text-center">
        <Reveal>
          <h2
            className="font-display text-white text-balance"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              letterSpacing: "0.04em",
            }}
          >
            READY TO TAKE THE FLOOR?
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 text-white/70 text-sm leading-relaxed text-pretty max-w-md mx-auto">
            Whether you&apos;re a seasoned delegate or looking to attend your
            first conference, MUNSoC NITJ provides the platform to elevate your
            voice.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="mt-8 inline-block"
          >
            <Link
              href="/join"
              className="bg-[#38bdf8] text-[#0a0a0a] font-heading font-semibold text-sm tracking-widest px-8 py-3 rounded hover:bg-[#7dd3fc] transition-colors inline-block shadow-lg shadow-[#38bdf8]/20"
            >
              APPLY TO JOIN MUNSOC TODAY
            </Link>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
