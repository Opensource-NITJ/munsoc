"use client";

import { Stagger, StaggerItem } from "@/components/motion";
import { motion } from "motion/react";

const pillars = [
  {
    label: "DIPLOMACY",
    desc: "Navigate conflict through dialogue and mutual understanding.",
  },
  {
    label: "LEADERSHIP",
    desc: "Cultivate voices that inspire and drive collective action.",
  },
  { label: "IMPACT", desc: "Draft solutions that matter on the world stage." },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export default function HistoryVision() {
  return (
    <section className="bg-[#121212] py-20 px-4">
      <Stagger
        className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch"
        stagger={0.15}
      >
        <StaggerItem className="bg-[#1c1c1e] border border-white/8 rounded-xl p-8 transition-colors duration-300 hover:border-white/15 flex flex-col">
          <div className="w-3 h-3 rounded-full bg-[#38bdf8] mb-5 mun-glow" />
          <h2
            className="font-display text-white tracking-wide text-2xl mb-4"
            style={{ letterSpacing: "0.04em" }}
          >
            OUR HISTORY
          </h2>
          <div className="space-y-4 text-white/70 text-sm leading-relaxed flex-1">
            <p>
              The NITJ MUN Society was established in 2024 by dedicated seniors
              from the Batches of 2025 and 2026. After successfully organizing a
              Youth Parliament in its inaugural year, the society temporarily
              paused operations due to a shortage of manpower. After a year of
              searching for the right team to carry the torch, we are thrilled
              to announce that the society has been officially revived as MUNSoC
              NITJ.
            </p>
            <p>
              Though we have a demanding journey ahead of us, we have full
              confidence in our organizing committee to steer us forward and
              elevate this society to its true potential. Further updates
              regarding our upcoming events will be conveyed shortly. We look
              forward to welcoming you to a new era of diplomacy and leadership
              at NITJ.
            </p>
          </div>
        </StaggerItem>

        <StaggerItem className="bg-[#1a3d5c] border border-[#38bdf8]/30 rounded-xl p-8 transition-colors duration-300 hover:border-[#38bdf8]/50 flex flex-col">
          <div className="w-3 h-3 rounded-full bg-[#38bdf8] mb-5 mun-glow" />
          <h2
            className="font-display text-white tracking-wide text-2xl mb-4"
            style={{ letterSpacing: "0.04em" }}
          >
            OUR VISION
          </h2>
          <p className="text-white/80 text-sm leading-relaxed mb-8">
            To cultivate a generation of articulate leaders, critical thinkers,
            and global citizens equipped to address the world&apos;s most
            pressing challenges through dialogue and diplomacy.
          </p>
          <div className="flex flex-col gap-4 flex-1 justify-end">
            {pillars.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: EASE }}
                className="flex items-start gap-3 group"
              >
                <span
                  className="font-display text-[#38bdf8] text-xs mt-0.5 shrink-0"
                  style={{ letterSpacing: "0.1em" }}
                >
                  0{i + 1}
                </span>
                <div>
                  <p className="font-heading font-bold text-white text-xs tracking-widest mb-0.5">
                    {p.label}
                  </p>
                  <p className="text-white/70 text-xs leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-[#38bdf8]/20">
            <p className="text-[#38bdf8]/60 text-[10px] font-heading tracking-[0.2em]">
              MUNSOC NITJ - EST. 2024
            </p>
          </div>
        </StaggerItem>
      </Stagger>
    </section>
  );
}
