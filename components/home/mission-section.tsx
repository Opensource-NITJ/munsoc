"use client";

import { Globe, Mic, FileText, Plane, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import NetworkCanvas from "./network-canvas";

const skills = [
  {
    icon: Mic,
    title: "Public Speaking",
    desc: "Command the room with confidence.",
  },
  {
    icon: FileText,
    title: "Negotiation",
    desc: "Draft resolutions and build consensus.",
  },
  {
    icon: Globe,
    title: "Research",
    desc: "Analyze complex international policy.",
  },
];

const cardBase =
  "bg-[#1c1c1e] border border-white/8 rounded-xl transition-all duration-300 hover:border-[#38bdf8]/30 hover:bg-[#202022]";

export default function MissionSection() {
  return (
    <section className="bg-[#121212] py-24 px-4">
      <div className="max-w-5xl mx-auto">
        
        <Reveal className="text-center mb-16">
          <h2
            className="font-display text-white tracking-wide"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              letterSpacing: "0.04em",
            }}
          >
            CULTIVATING GLOBAL PERSPECTIVES
          </h2>
          <p className="mt-3 text-white/70 text-sm max-w-xl mx-auto leading-relaxed text-pretty">
            More than just a society, we are a crucible for leadership,
            analytical thinking, and effective communication on the world stage.
          </p>
        </Reveal>

        <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <StaggerItem
            className={`${cardBase} p-8 flex flex-col justify-between min-h-56 group`}
          >
            <Globe
              size={28}
              className="text-[#38bdf8] mb-4 transition-transform duration-500 group-hover:rotate-12"
              strokeWidth={1.5}
            />
            <div>
              <p className="text-[#38bdf8] text-[10px] font-heading tracking-widest mb-1">
                OUR MISSION
              </p>
              <p className="text-white/60 text-sm leading-relaxed">
                To provide an unparalleled platform for students to engage with
                complex global issues, develop nuanced diplomatic skills, and
                foster a community of critically engaged global citizens ready
                to tackle the challenges of the 21st century.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem className={`${cardBase} p-8`}>
            <p className="text-[#38bdf8] text-[10px] font-heading tracking-widest mb-5">
              SKILL DEVELOPMENT
            </p>
            <div className="flex flex-col gap-5">
              {skills.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 group/skill"
                  >
                    <span className="text-[#38bdf8] mt-0.5 transition-transform duration-300 group-hover/skill:scale-110">
                      <Icon size={16} strokeWidth={1.5} />
                    </span>
                    <div>
                      <p className="text-white text-sm font-medium">
                        {item.title}
                      </p>
                      <p className="text-white/60 text-xs">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </StaggerItem>

          <StaggerItem
            className={`${cardBase} overflow-hidden relative min-h-52 group p-0`}
          >
            <NetworkCanvas />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/30 to-transparent pointer-events-none" />

            <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
              <p className="font-heading font-bold text-white tracking-wide text-lg">
                A NETWORK OF LEADERS
              </p>
              <p className="text-white/70 text-xs mt-1">
                Connect with driven individuals from across disciplines.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem
            className={`${cardBase} p-8 flex flex-col justify-between group`}
          >
            <Plane
              size={28}
              className="text-[#38bdf8] mb-4 transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-1"
              strokeWidth={1.5}
            />
            <div>
              <p className="text-[#38bdf8] text-[10px] font-heading tracking-widest mb-2">
                EXPOSURE
              </p>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                We regularly sponsor delegations to premier Model UN conferences
                across India. Represent NITJ on the biggest stages and test your
                skills against the best.
              </p>
              <Link
                href="/committees"
                className="text-[#38bdf8] text-xs font-heading tracking-widest hover:underline flex items-center gap-1 group/link w-fit"
              >
                VIEW PAST DELEGATIONS
                <ArrowRight
                  size={13}
                  className="transition-transform duration-300 group-hover/link:translate-x-1"
                />
              </Link>
            </div>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
