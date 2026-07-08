"use client";

import Link from "next/link";
import { Lock, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { Stagger, StaggerItem, Reveal } from "@/components/motion";

const activeCommittees = [
  {
    code: "AIPPM",
    name: "All India Political Parties Meet (AIPPM)",
    organizer: "MUNSoC NITJ",
    desc: "All India Political Parties Meet, simulating Indian political debates and policy negotiations on crucial national topics.",
    href: "/committees/aippm",
  },
];

export default function CommitteesGrid() {
  return (
    <section className="py-16 px-4 bg-[#121212]">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-xl mx-auto mb-16">
          <Stagger className="grid grid-cols-1 gap-5">
            {activeCommittees.map((c) => (
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

        <Reveal className="text-center mt-12 max-w-md mx-auto">
          <p className="text-white/40 text-xs leading-relaxed mb-3">
            Committee details, agendas, and background guides will be released as the conference date approaches. Follow us on Instagram for live updates.
          </p>
          <Link
            href="https://instagram.com/nitjmunsociety"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#38bdf8] hover:text-[#7dd3fc] text-xs font-heading font-semibold tracking-widest transition-colors inline-flex items-center gap-1"
          >
            FOLLOW ON INSTAGRAM &rarr;
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
