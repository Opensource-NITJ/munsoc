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
  MapPin,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem, CountUp } from "@/components/motion";
import { motion } from "motion/react";

const committees = [
  {
    code: "AIPPM",
    name: "All India Political Parties Meet (AIPPM)",
    organizer: "MUNSoC NITJ",
    desc: "All India Political Parties Meet, simulating Indian political debates and policy negotiations on crucial national topics.",
    href: "/committees/aippm",
  },
];

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
            COMMITTEES ACTIVE
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

        <div className="max-w-xl mx-auto mb-16">
          <Stagger className="grid grid-cols-1 gap-5">
            {committees.map((c) => (
              <StaggerItem
                key={c.code}
                className="bg-gradient-to-br from-[#1c1c1e] to-[#121c26]/50 border border-[#38bdf8]/25 rounded-xl p-6 relative overflow-hidden group transition-all duration-300 hover:border-[#38bdf8]/50 hover:shadow-lg hover:shadow-[#38bdf8]/10 flex flex-col justify-between min-h-[220px] shadow-sm shadow-[#38bdf8]/5"
              >
                <Link href={c.href} className="absolute inset-0 z-10" aria-label={`View ${c.name}`} />
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#38bdf8] text-[9px] font-heading font-semibold tracking-widest uppercase">
                        {c.organizer}
                      </span>
                      <span className="text-white/40 text-[9px] font-heading font-medium tracking-wider flex items-center gap-1.5 uppercase">
                        <MapPin size={8} className="text-[#38bdf8]" />
                        Online &bull; 16 July 2026, 9:00 AM
                      </span>
                    </div>
                    <span className="bg-[#38bdf8]/15 text-[#38bdf8] text-[9px] font-heading font-semibold tracking-widest px-2 py-0.5 rounded border border-[#38bdf8]/20">
                      {c.code}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-white text-base mb-2 pr-12 tracking-wide transition-colors group-hover:text-[#38bdf8]">
                    {c.name}
                  </h3>
                  <p className="text-white/60 text-xs leading-relaxed mb-4">{c.desc}</p>
                </div>
                <span className="text-[#38bdf8]/80 text-xs font-heading font-medium tracking-widest group-hover:text-[#38bdf8] transition-colors flex items-center gap-1 mt-auto">
                  EXPLORE COMMITTEE <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                </span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

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
