"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";

const stackedLines = [
  "WE ARE BACK",
  "WE ARE BACK",
  "WE ARE BACK",
  "WE ARE BACK",
  "WE ARE BACK",
  "WE ARE BACK",
  "WE ARE BACK",
];

const EASE = [0.22, 1, 0.36, 1] as const;

export default function HeroSection() {
  const reduce = useReducedMotion();
  const middle = Math.floor(stackedLines.length / 2);

  return (
    <section className="relative overflow-hidden bg-[#0a0a0a]">
      <div
        className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 h-[480px] w-[480px] rounded-full bg-[#38bdf8]/10 blur-[130px] mun-glow"
        aria-hidden
      />

      <div className="relative flex flex-col items-center overflow-hidden py-4 select-none pointer-events-none">
        {stackedLines.map((line, i) => {
          const isMiddle = i === middle;
          const dist = Math.abs(i - middle);
          const finalOpacity = isMiddle
            ? 1
            : 0.025 + (i / stackedLines.length) * 0.11;

          return (
            <div
              key={i}
              className={`leading-[0.92] w-full text-center font-display whitespace-nowrap ${
                reduce ? "" : "animate-hero-fade-in-up"
              }`}
              style={{
                fontSize: "clamp(2.8rem, 11vw, 8.5rem)",
                color: isMiddle ? "#38bdf8" : "#ffffff",
                letterSpacing: "0.05em",
                opacity: finalOpacity,
                animationDelay: reduce ? undefined : `${0.06 * dist}s`,
                animationFillMode: reduce ? undefined : "both",
                ["--target-opacity" as any]: finalOpacity,
              } as React.CSSProperties}
              aria-hidden={!isMiddle}
            >
              {line}
            </div>
          );
        })}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto pb-28 pt-10">
        <Link
          href="/committees/aippm"
          className={`inline-flex items-center gap-2 border border-[#38bdf8]/35 bg-[#38bdf8]/5 text-[#38bdf8] hover:border-[#38bdf8]/60 hover:bg-[#38bdf8]/10 text-[10px] font-heading tracking-[0.2em] px-4 py-1.5 rounded-full mb-6 transition-all duration-300 hover:scale-105 shadow-md shadow-[#38bdf8]/5 ${
            reduce ? "" : "animate-hero-fade-in-up"
          }`}
          style={{
            animationDelay: reduce ? undefined : "0.5s",
            animationFillMode: reduce ? undefined : "both",
            ["--target-opacity" as any]: 1,
          } as React.CSSProperties}
        >
          <span className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full animate-ping" />
          ONLINE MUN (AIPPM): 16 JULY 9AM &rarr;
        </Link>

        <h1
          className="font-display text-white leading-[0.95] text-balance"
          style={{
            fontSize: "clamp(2.4rem, 7.5vw, 5.5rem)",
            letterSpacing: "0.04em",
          }}
        >
          {["EMPOWERING", "THE"].map((word, i) => (
            <span
              key={word}
              className={`inline-block mr-[0.22em] ${
                reduce ? "" : "animate-hero-fade-in-up"
              }`}
              style={{
                animationDelay: reduce ? undefined : `${0.55 + i * 0.08}s`,
                animationFillMode: reduce ? undefined : "both",
                ["--target-opacity" as any]: 1,
              } as React.CSSProperties}
            >
              {word}
            </span>
          ))}
          <span
            className={`inline-block text-[#38bdf8] mr-[0.22em] ${
              reduce ? "" : "animate-hero-fade-in-up"
            }`}
            style={{
              animationDelay: reduce ? undefined : "0.71s",
              animationFillMode: reduce ? undefined : "both",
              ["--target-opacity" as any]: 1,
            } as React.CSSProperties}
          >
            DIPLOMATS
          </span>
          <br />
          <span
            className={`inline-block ${
              reduce ? "" : "animate-hero-fade-in-up"
            }`}
            style={{
              animationDelay: reduce ? undefined : "0.8s",
              animationFillMode: reduce ? undefined : "both",
              ["--target-opacity" as any]: 1,
            } as React.CSSProperties}
          >
            OF TOMORROW
          </span>
        </h1>

        <p
          className={`mt-6 text-white/70 text-sm sm:text-base leading-relaxed max-w-xl text-pretty ${
            reduce ? "" : "animate-hero-fade-in-up"
          }`}
          style={{
            animationDelay: reduce ? undefined : "0.95s",
            animationFillMode: reduce ? undefined : "both",
            ["--target-opacity" as any]: 1,
          } as React.CSSProperties}
        >
          Join a legacy of rigorous debate, international diplomacy, and student
          leadership at Dr. B.R. Ambedkar National Institute of Technology
          Jalandhar.
        </p>

        <div
          className={`flex flex-wrap gap-4 mt-8 justify-center ${
            reduce ? "" : "animate-hero-fade-in-up"
          }`}
          style={{
            animationDelay: reduce ? undefined : "1.05s",
            animationFillMode: reduce ? undefined : "both",
            ["--target-opacity" as any]: 1,
          } as React.CSSProperties}
        >
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="/committees/aippm"
              className="bg-[#38bdf8] text-[#0a0a0a] font-display text-sm tracking-widest px-7 py-3 rounded-lg hover:bg-[#7dd3fc] transition-colors inline-block shadow-lg shadow-[#38bdf8]/25"
              style={{ letterSpacing: "0.1em" }}
            >
              PARTICIPATE NOW
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="/committees"
              className="group border border-white/20 text-white font-heading font-medium text-sm tracking-widest px-7 py-3 rounded-lg hover:border-[#38bdf8]/60 hover:text-[#38bdf8] transition-colors flex items-center gap-2"
            >
              EXPLORE COMMITTEES
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
