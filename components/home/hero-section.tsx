"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";

const AshokaChakra = () => (
  <svg
    viewBox="0 0 100 100"
    className="inline-block align-middle w-[0.8em] h-[0.8em] text-[#38bdf8] translate-y-[-0.1em] animate-[spin_20s_linear_infinite]"
    style={{ marginLeft: "-0.01em", marginRight: "0.06em" }}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <circle cx="50" cy="50" r="44" />
    <circle cx="50" cy="50" r="10" fill="currentColor" />
    {Array.from({ length: 24 }).map((_, i) => (
      <line
        key={i}
        x1="50"
        y1="50"
        x2="50"
        y2="6"
        transform={`rotate(${i * 15} 50 50)`}
      />
    ))}
  </svg>
);

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();
  const reduce = mounted && Boolean(reduceMotion);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#0a0a0a] min-h-[90vh] flex flex-col justify-center pt-20">
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-[#38bdf8]/15 blur-[140px] mun-glow"
        aria-hidden
      />

      {/* Massive Poster Text */}
      <div className="relative z-0 flex flex-col items-center w-full select-none pointer-events-none mt-8 pb-0">
        <div
          className={`font-poster w-full text-center whitespace-nowrap text-white ${reduce ? "" : "animate-hero-fade-in-up"}`}
          style={{
            fontSize: "clamp(7rem, 24vw, 17rem)",
            lineHeight: "0.8",
            letterSpacing: "0.01em",
            marginLeft: "-0.1em",
            animationDelay: reduce ? undefined : "0.1s",
            animationFillMode: reduce ? undefined : "both",
          }}
        >
          <span className="inline-block" style={{ transform: "scaleY(1.35)" }}>
            Y
          </span>
          <AshokaChakra />
          <span className="inline-block" style={{ transform: "scaleY(1.35)" }}>
            UTH
          </span>
        </div>

        <div
          className={`font-poster w-full text-center whitespace-nowrap text-white/40 mt-2 sm:mt-5 ${reduce ? "" : "animate-hero-fade-in-up"}`}
          style={{
            fontSize: "clamp(4rem, 16vw, 10rem)",
            lineHeight: "0.8",
            transform: "scaleY(1.6)",
            letterSpacing: "0.05em",
            animationDelay: reduce ? undefined : "0.3s",
            animationFillMode: reduce ? undefined : "both",
          }}
        >
          PARLIAMENT
        </div>
      </div>

      {/* Lower Details */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto pb-24 pt-4 mt-2 sm:mt-8">
        <Link
          href="/committees/ypm"
          className={`inline-flex items-center gap-2 border border-[#38bdf8]/35 bg-[#38bdf8]/5 text-[#38bdf8] hover:border-[#38bdf8]/60 hover:bg-[#38bdf8]/10 text-[10px] font-heading tracking-[0.2em] px-4 py-1.5 rounded-full mb-12 transition-all duration-300 hover:scale-105 shadow-md shadow-[#38bdf8]/5 ${
            reduce ? "" : "animate-hero-fade-in-up"
          }`}
          style={
            {
              animationDelay: reduce ? undefined : "0.5s",
              animationFillMode: reduce ? undefined : "both",
              ["--target-opacity" as any]: 1,
            } as React.CSSProperties
          }
        >
          <span className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full animate-ping" />
          YOUTH PARLIAMENT: 18 OCTOBER 2026 &rarr;
        </Link>

        <h1
          className="font-display text-white leading-[1.0] flex flex-col items-center text-center w-full"
          style={{ letterSpacing: "0.04em" }}
        >
          {/* Line 1: EMPOWERING THE */}
          <span
            className={`flex items-center justify-center gap-[0.22em] ${reduce ? "" : "animate-hero-fade-in-up"}`}
            style={
              {
                fontSize: "clamp(2.4rem, 7.5vw, 5.5rem)",
                animationDelay: reduce ? undefined : "0.55s",
                animationFillMode: reduce ? undefined : "both",
                ["--target-opacity" as any]: 1,
              } as React.CSSProperties
            }
          >
            <span>EMPOWERING</span>
            <span>THE</span>
          </span>

          {/* Line 2: DIPLOMATS — scaled wider to match line width */}
          <span
            className={`text-[#38bdf8] ${reduce ? "" : "animate-hero-fade-in-up"}`}
            style={
              {
                fontSize: "clamp(3.2rem, 10.5vw, 7.5rem)",
                animationDelay: reduce ? undefined : "0.68s",
                animationFillMode: reduce ? undefined : "both",
                ["--target-opacity" as any]: 1,
              } as React.CSSProperties
            }
          >
            DIPLOMATS
          </span>

          {/* Line 3: OF TOMORROW */}
          <span
            className={reduce ? "" : "animate-hero-fade-in-up"}
            style={
              {
                fontSize: "clamp(2.4rem, 7.5vw, 5.5rem)",
                animationDelay: reduce ? undefined : "0.8s",
                animationFillMode: reduce ? undefined : "both",
                ["--target-opacity" as any]: 1,
              } as React.CSSProperties
            }
          >
            OF TOMORROW
          </span>
        </h1>

        <p
          className={`mt-6 text-white/70 text-sm sm:text-base leading-relaxed max-w-xl text-pretty ${
            reduce ? "" : "animate-hero-fade-in-up"
          }`}
          style={
            {
              animationDelay: reduce ? undefined : "0.95s",
              animationFillMode: reduce ? undefined : "both",
              ["--target-opacity" as any]: 1,
            } as React.CSSProperties
          }
        >
          Join a legacy of rigorous debate, international diplomacy, and student
          leadership at Dr. B.R. Ambedkar National Institute of Technology
          Jalandhar.
        </p>

        <div
          className={`flex flex-wrap gap-4 mt-8 justify-center ${
            reduce ? "" : "animate-hero-fade-in-up"
          }`}
          style={
            {
              animationDelay: reduce ? undefined : "1.05s",
              animationFillMode: reduce ? undefined : "both",
              ["--target-opacity" as any]: 1,
            } as React.CSSProperties
          }
        >
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              href="/committees/ypm"
              className="bg-[#38bdf8] text-[#0a0a0a] font-heading font-medium text-sm tracking-widest px-7 py-3 rounded-lg hover:bg-[#7dd3fc] transition-colors inline-block shadow-lg shadow-[#38bdf8]/25"
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
