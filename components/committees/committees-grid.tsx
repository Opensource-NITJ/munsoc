"use client";

import Link from "next/link";
import {
  MapPin,
  Calendar,
  ArrowRight,
  Landmark,
  Users,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { Reveal } from "@/components/motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function CommitteesGrid() {
  return (
    <section className="py-16 px-4 bg-[#121212]">
      <div className="max-w-5xl mx-auto w-full">
        {/* Full-Width Youth Parliament Card */}
        <Reveal className="mb-16">
          <div className="relative overflow-hidden rounded-2xl border border-[#38bdf8]/30 bg-gradient-to-br from-[#1c1c1e] via-[#141e28] to-[#0c1620] p-6 sm:p-10 shadow-2xl shadow-[#38bdf8]/10 group transition-all duration-500 hover:border-[#38bdf8]/50 w-full">
            {/* Background Glow Accents */}
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#38bdf8]/10 blur-[100px] mun-glow"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-[#38bdf8]/5 blur-[80px]"
              aria-hidden
            />

            <div className="relative z-10 flex flex-col gap-8">
              {/* Top Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-white/60 text-xs font-heading font-medium tracking-wider uppercase">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-[#38bdf8]" />
                      Mode: Offline
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1 text-white/80">
                      <Calendar size={13} className="text-[#38bdf8]" />
                      18 October 2026
                    </span>
                  </div>
                </div>
              </div>

              {/* Title & Core Description */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <h2
                    className="font-poster text-white text-4xl sm:text-5xl md:text-6xl tracking-wide leading-[0.95]"
                    style={{
                      letterSpacing: "0.05em",
                    }}
                  >
                    YOUTH PARLIAMENT{" "}
                    <span className="text-[#38bdf8]">(YPM)</span>
                  </h2>
                </div>

                <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-4xl text-pretty">
                  This conference agenda focuses on modernizing India's
                  educational ecosystem. It aims to foster constructive dialogue
                  on shifting from rote learning to competency-based evaluation.
                  Key areas include integrating advanced technology for secure
                  and transparent logistics, and institutionalizing continuous
                  assessment to reduce student stress. Ultimately, the goal is
                  to build a resilient, world-class assessment infrastructure
                  through bipartisan cooperation.
                </p>
              </div>

              {/* Features & Committee Highlights Grid */}
              <div className="w-full pt-2">
                <div className="bg-[#121212]/80 border border-white/8 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                  <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex items-center gap-2 text-[#38bdf8]">
                      <Sparkles size={18} />
                      <h4 className="font-heading font-semibold text-xs text-white tracking-wider uppercase">
                        Agenda
                      </h4>
                    </div>
                    <p className="text-white/55 text-xs leading-relaxed">
                      Discussions on comprehensive reforms to the Indian
                      examination system.
                    </p>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0"
                  >
                    <Link
                      href="/committees/ypm"
                      className="bg-[#38bdf8] text-[#0a0a0a] font-heading font-bold text-xs tracking-widest px-6 py-2.5 rounded-lg hover:bg-[#7dd3fc] transition-all shadow-lg shadow-[#38bdf8]/20 flex items-center gap-2 whitespace-nowrap"
                    >
                      REGISTER
                      <ArrowRight size={14} />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="mb-16">
          <div className="bg-[#1a3d5c]/20 border border-[#38bdf8]/20 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#38bdf8]/10 rounded-full flex items-center justify-center shrink-0">
                <svg
                  className="w-6 h-6 text-[#38bdf8]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.168.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-bold text-white tracking-wide">
                  THE MUN GUIDEBOOK: MUN 101
                </h3>
                <p className="text-white/60 text-xs mt-1">
                  Master the art of diplomacy with our official guide.
                </p>
              </div>
            </div>
            <Link
              href="/guidebook.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap bg-white text-black font-heading font-bold text-[10px] tracking-[0.2em] px-6 py-3 rounded hover:bg-[#38bdf8] transition-colors"
            >
              DOWNLOAD PDF
            </Link>
          </div>
        </Reveal>

        {/* Informational Callout */}
        <Reveal className="bg-[#1a3d5c]/30 border border-[#38bdf8]/20 rounded-2xl p-8 md:p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#38bdf8]/5 blur-[60px] rounded-full" />
          <h3 className="font-display text-white text-2xl mb-3 tracking-wide">
            STAY TUNED FOR UPDATES
          </h3>
          <p className="text-white/70 text-sm leading-relaxed max-w-xl mx-auto mb-6 text-pretty">
            Detailed agenda matrices, background guides, and committee schedules
            will be published prior to the conference. Follow our official
            channels for live announcements.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="https://instagram.com/nitjmunsociety"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 text-white font-heading font-semibold text-xs tracking-widest px-7 py-3 rounded-lg hover:border-[#38bdf8] hover:text-[#38bdf8] transition-colors"
            >
              FOLLOW ON INSTAGRAM &rarr;
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
