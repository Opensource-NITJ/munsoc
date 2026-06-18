"use client";

import MemberCard from "./member-card";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

const committeeMembers = [
  { name: "Harneet", role: "" },
  { name: "Naman", role: "" },
  { name: "Mohit", role: "" },
  { name: "Bhavya", role: "" },
  { name: "Ramneet", role: "" },
  { name: "Prabhleen", role: "" },
  { name: "Karthik", role: "" },
  { name: "Aumansh", role: "" },
];

export default function CommitteeMembers() {
  return (
    <section className="bg-[#121212] py-20 px-4">
      <div className="max-w-5xl mx-auto">
        
        <Reveal className="text-center mb-12">
          <h2
            className="font-display text-white"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              letterSpacing: "0.04em",
            }}
          >
            COMMITTEE MEMBERS
          </h2>
          <p className="mt-3 text-white/70 text-sm max-w-md mx-auto leading-relaxed text-pretty">
            The passionate individuals contributing to the success of our
            society&apos;s initiatives.
          </p>
        </Reveal>

        <Stagger
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          stagger={0.06}
        >
          {committeeMembers.map((member) => (
            <StaggerItem key={member.name + member.role}>
              <MemberCard
                name={member.name}
                role={member.role}
                size="sm"
                imagePath={`/assets/committee/${member.name.toLowerCase().replace(/\s+/g, "-")}.jpg`}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
