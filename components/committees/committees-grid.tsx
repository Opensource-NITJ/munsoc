"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { motion } from "motion/react";
import { Stagger, StaggerItem, Reveal } from "@/components/motion";

const comingSoonCommittees = [
  { code: "TBA", name: "To Be Announced" },
  { code: "TBA", name: "To Be Announced" },
  { code: "TBA", name: "To Be Announced" },
  { code: "TBA", name: "To Be Announced" },
];

const desc =
  "Details of this committee will be revealed soon. Stay tuned for the agenda and guidebook.";

export default function CommitteesGrid() {
  return (
    <section className="py-16 px-4 bg-[#121212]">
      <div className="max-w-5xl mx-auto">
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
          {comingSoonCommittees.map((c, i) => (
            <StaggerItem
              key={i}
              className="bg-[#1c1c1e] border border-white/8 rounded-xl p-6 relative overflow-hidden group transition-colors duration-300 hover:border-[#38bdf8]/30"
            >
              <div className="absolute inset-0 backdrop-blur-[2px] bg-[#1c1c1e]/60 flex flex-col items-center justify-center gap-2 rounded-xl z-10 transition-all duration-300 group-hover:backdrop-blur-[3px]">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-1.5 border border-[#38bdf8]/30 text-[#38bdf8] text-[10px] font-heading tracking-[0.2em] px-3 py-1 rounded-sm"
                >
                  <Lock size={11} strokeWidth={2} />
                  COMING SOON
                </motion.div>
                <p className="text-white/60 text-xs font-heading tracking-widest">
                  DETAILS TO BE REVEALED
                </p>
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

        <Reveal className="bg-[#1a3d5c]/40 border border-[#38bdf8]/20 rounded-xl p-8 text-center">
          <h2
            className="font-display text-white text-2xl mb-3"
            style={{ letterSpacing: "0.06em" }}
          >
            STAY TUNED
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-lg mx-auto mb-6 text-pretty">
            Committee details, agendas, and background guides will be released
            as the conference date approaches. Follow us on Instagram or check
            back here for updates.
          </p>
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="inline-block"
          >
            <Link
              href="/join"
              className="bg-[#38bdf8] text-[#0a0a0a] font-heading font-semibold text-sm tracking-widest px-7 py-2.5 rounded hover:bg-[#7dd3fc] transition-colors inline-block shadow-lg shadow-[#38bdf8]/20"
            >
              REGISTER YOUR INTEREST
            </Link>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
