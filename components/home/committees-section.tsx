"use client";

import Link from "next/link";
import {
  CalendarDays,
  Users,
  Trophy,
  Mic2,
  Lock,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem, CountUp } from "@/components/motion";
import { motion } from "motion/react";

const committees = [
  { code: "TBA", name: "To Be Announced" },
  { code: "TBA", name: "To Be Announced" },
];

const desc =
  "Details of this committee will be revealed soon. Stay tuned for the agenda and guidebook.";

const stats = [
  { icon: CalendarDays, value: 2, suffix: "+", label: "YEARS OF LEGACY" },
  { icon: Users, value: 50, suffix: "+", label: "DELEGATES TRAINED" },
  { icon: Trophy, value: 0, suffix: "", label: "AWARDS WON", display: "-" },
  { icon: Mic2, value: 1, suffix: "", label: "CONFERENCES HOSTED" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export default function CommitteesSection() {
  return (
    <section className="bg-[#0d0d0d] py-24 px-4">
      <div className="max-w-5xl mx-auto">
        
        <Reveal className="text-center mb-14">
          <div className="inline-block border border-[#38bdf8]/30 text-[#38bdf8] text-[10px] font-heading tracking-[0.2em] px-3 py-1 rounded-sm mb-4">
            ANNOUNCING COMMITTEES SOON
          </div>
          <h2
            className="font-display text-white"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              letterSpacing: "0.04em",
            }}
          >
            COMMITTEES &amp; AGENDA
          </h2>
          <p className="mt-3 text-white/70 text-sm max-w-xl mx-auto leading-relaxed text-pretty">
            Explore the upcoming simulated assemblies. Each committee will
            challenge delegates with highly critical, multi-faceted global
            topics.
          </p>
        </Reveal>

        <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {committees.map((c, i) => (
            <StaggerItem
              key={i}
              className="bg-[#1c1c1e] border border-white/8 rounded-xl p-6 relative overflow-hidden group transition-colors duration-300 hover:border-[#38bdf8]/30"
            >
              
              <div className="absolute inset-0 backdrop-blur-[2px] bg-[#1c1c1e]/60 flex flex-col items-center justify-center gap-2 rounded-xl z-10 transition-all duration-300 group-hover:backdrop-blur-[3px]">
                <motion.div
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="flex items-center gap-1.5 border border-[#38bdf8]/30 text-[#38bdf8] text-[10px] font-heading tracking-[0.2em] px-3 py-1 rounded-sm"
                >
                  <Lock size={11} strokeWidth={2} />
                  COMING SOON
                </motion.div>
                <p className="text-white/60 text-xs font-heading tracking-widest">
                  DETAILS TO BE REVEALED
                </p>
                <Link
                  href="/committees"
                  className="mt-1 text-[#38bdf8]/60 text-[10px] font-heading tracking-widest hover:text-[#38bdf8] transition-colors flex items-center gap-1 group/link"
                >
                  VIEW ALL COMMITTEES
                  <ArrowRight
                    size={11}
                    className="transition-transform duration-300 group-hover/link:translate-x-1"
                  />
                </Link>
              </div>
              
              <span className="absolute top-4 right-4 bg-[#38bdf8]/10 text-[#38bdf8] text-[10px] font-heading tracking-widest px-2 py-0.5 rounded">
                {c.code}
              </span>
              <h3 className="font-heading font-semibold text-white text-lg mb-2 pr-16 tracking-wide">
                {c.name}
              </h3>
              <p className="text-white/60 text-sm mb-4">{desc}</p>
              <span className="text-[#38bdf8] text-xs font-heading tracking-widest">
                Guidebook coming soon &rarr;
              </span>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mb-20">
          <div className="bg-[#1a3d5c]/20 border border-[#38bdf8]/20 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#38bdf8]/10 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.168.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-bold text-white tracking-wide">THE MUN GUIDEBOOK: MUN 101</h3>
                <p className="text-white/60 text-xs mt-1">Master the art of diplomacy with our official guide.</p>
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

        <Stagger
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-white/5 pt-14"
          stagger={0.12}
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <StaggerItem
                key={stat.label}
                className="flex flex-col items-center text-center gap-2 group"
              >
                <Icon
                  size={22}
                  strokeWidth={1.5}
                  className="text-[#38bdf8] transition-transform duration-300 group-hover:-translate-y-1"
                />
                <span
                  className="font-display text-white"
                  style={{
                    fontSize: "clamp(2rem, 5vw, 3.5rem)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {stat.display ? (
                    stat.display
                  ) : (
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  )}
                </span>
                <span className="text-white/60 text-[10px] font-heading tracking-widest">
                  {stat.label}
                </span>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
