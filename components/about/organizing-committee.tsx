"use client";

import MemberCard from "./member-card";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

const orgCommittee = [
  { name: "Ravneet Kaur", role: "President" },
  { name: "Harshit Dhingra", role: "Secretary General" },
  { name: "Manroop", role: "Under Secretary General" },
  { name: "Pratham", role: "USG of Academics" },
  { name: "Sukhman", role: "USG of Logistics" },
  { name: "Samaira", role: "USG of Finance" },
  { name: "Prabhleen", role: "USG of Marketing" },
  { name: "Ashmit", role: "USG of International Press" },
  { name: "Kamal", role: "USG of Public Relations" },
  { name: "Saniya", role: "Chief Mentor" },
];

export default function OrganizingCommittee() {
  return (
    <section className="bg-[#0d0d0d] py-20 px-4">
      <div className="max-w-5xl mx-auto">
        
        <Reveal className="text-center mb-12">
          <h2
            className="font-display text-white"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              letterSpacing: "0.04em",
            }}
          >
            ORGANIZING COMMITTEE
          </h2>
          <p className="mt-3 text-white/70 text-sm max-w-md mx-auto leading-relaxed text-pretty">
            The dedicated leadership driving the society&apos;s mission and
            organizing our flagship conferences.
          </p>
        </Reveal>

        <Stagger
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          stagger={0.06}
        >
          {orgCommittee.map((member) => (
            <StaggerItem key={member.name}>
              <MemberCard
                name={member.name}
                role={member.role}
                imagePath={`/assets/team/${member.name.toLowerCase().replace(/\s+/g, "-")}.jpg`}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
