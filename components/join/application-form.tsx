"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  ChevronDown,
  User,
  Mail,
  BookOpen,
  Building2,
  Mic2,
  FileText,
} from "lucide-react";

const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const EASE = [0.22, 1, 0.36, 1] as const;

const inputClass =
  "bg-[#0d0d0d] border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#38bdf8]/60 focus:ring-1 focus:ring-[#38bdf8]/20 transition-all duration-200 w-full";

const labelClass =
  "text-white/70 text-[10px] font-heading tracking-[0.18em] flex items-center gap-1.5 mb-1.5";

function YearSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${inputClass} flex items-center justify-between cursor-pointer select-none group`}
      >
        <span className={value ? "text-white" : "text-white/25"}>
          {value || "Select year"}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <ChevronDown
            size={16}
            className="text-white/40 group-hover:text-[#38bdf8] transition-colors"
          />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.95 }}
            transition={{ duration: 0.2, ease: EASE }}
            style={{ transformOrigin: "top" }}
            className="absolute z-50 top-full mt-1.5 left-0 right-0 bg-[#141414] border border-white/10 rounded-lg overflow-hidden shadow-2xl shadow-black/60"
          >
            {yearOptions.map((y, i) => (
              <motion.li
                key={y}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2, ease: EASE }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onChange(y);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-heading tracking-wider transition-colors duration-150 flex items-center justify-between group/opt ${
                    value === y
                      ? "text-[#38bdf8] bg-[#38bdf8]/10"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {y}
                  {value === y && (
                    <Check size={13} className="text-[#38bdf8]" />
                  )}
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ApplicationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const deptRef = useRef<HTMLInputElement>(null);
  const expRef = useRef<HTMLTextAreaElement>(null);
  const sopRef = useRef<HTMLTextAreaElement>(null);

  const isFormDisabled = true;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      firstName: firstNameRef.current?.value ?? "",
      lastName: lastNameRef.current?.value ?? "",
      email: emailRef.current?.value ?? "",
      year,
      department: deptRef.current?.value ?? "",
      experience: expRef.current?.value ?? "",
      sop: sopRef.current?.value ?? "",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Submission failed. Please try again.");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="bg-[#141414] border border-white/8 rounded-2xl overflow-hidden"
    >
      
      <div className="border-b border-white/8 px-8 py-5 flex items-center justify-between bg-[#1c1c1e]">
        <div>
          <h2
            className="font-display text-white tracking-wide text-xl"
            style={{ letterSpacing: "0.06em" }}
          >
            APPLICATION FORM
          </h2>
          <p className="text-white/60 text-xs font-heading tracking-widest mt-0.5">
            MUNSOC NITJ - MEMBERSHIP 2026
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-pulse" />
          <span className="text-[#38bdf8] text-[10px] font-heading tracking-widest">
            REGISTRATIONS OPEN SOON
          </span>
        </div>
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="text-center py-16"
            >
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.15,
                  type: "spring",
                  stiffness: 200,
                  damping: 14,
                }}
                className="w-14 h-14 border-2 border-[#38bdf8] rounded-full flex items-center justify-center mx-auto mb-5 bg-[#38bdf8]/10"
              >
                <Check size={24} className="text-[#38bdf8]" />
              </motion.div>
              <p
                className="font-display text-white tracking-wide text-2xl mb-2"
                style={{ letterSpacing: "0.06em" }}
              >
                APPLICATION RECEIVED
              </p>
              <p className="text-white/70 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
                Thank you for applying! We&apos;ll be in touch via your
                university email soon.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-6"
            >
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>
                    <User size={11} className="text-[#38bdf8]" />
                    FIRST NAME <span className="text-[#38bdf8]">*</span>
                  </label>
                  <input
                    ref={firstNameRef}
                    type="text"
                    placeholder="John"
                    required
                    className={inputClass}
                    onFocus={() => setFocused("fn")}
                    onBlur={() => setFocused(null)}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <User size={11} className="text-[#38bdf8]" />
                    LAST NAME <span className="text-[#38bdf8]">*</span>
                  </label>
                  <input
                    ref={lastNameRef}
                    type="text"
                    placeholder="Doe"
                    required
                    className={inputClass}
                    onFocus={() => setFocused("ln")}
                    onBlur={() => setFocused(null)}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  <Mail size={11} className="text-[#38bdf8]" />
                  UNIVERSITY EMAIL <span className="text-[#38bdf8]">*</span>
                </label>
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="johndoe.cs.25@nitj.ac.in"
                  required
                  className={inputClass}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>
                    <BookOpen size={11} className="text-[#38bdf8]" />
                    YEAR OF STUDY <span className="text-[#38bdf8]">*</span>
                  </label>
                  <YearSelect value={year} onChange={setYear} />
                </div>
                <div>
                  <label className={labelClass}>
                    <Building2 size={11} className="text-[#38bdf8]" />
                    DEPARTMENT <span className="text-[#38bdf8]">*</span>
                  </label>
                  <input
                    ref={deptRef}
                    type="text"
                    placeholder="Computer Science"
                    required
                    className={inputClass}
                    onFocus={() => setFocused("dept")}
                    onBlur={() => setFocused(null)}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  <Mic2 size={11} className="text-[#38bdf8]" />
                  PREVIOUS MUN EXPERIENCE
                </label>
                <textarea
                  ref={expRef}
                  rows={3}
                  placeholder="Briefly describe past conferences attended..."
                  className={`${inputClass} resize-none`}
                  onFocus={() => setFocused("exp")}
                  onBlur={() => setFocused(null)}
                />
              </div>

              <div>
                <label className={labelClass}>
                  <FileText size={11} className="text-[#38bdf8]" />
                  STATEMENT OF PURPOSE
                </label>
                <textarea
                  ref={sopRef}
                  rows={4}
                  placeholder="Why do you want to join MUNSoC NITJ?"
                  className={`${inputClass} resize-none`}
                  onFocus={() => setFocused("sop")}
                  onBlur={() => setFocused(null)}
                />
              </div>

              <div className="border-t border-white/6" />

              {error && (
                <p className="text-red-400 text-xs font-heading tracking-wide text-center">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="text-white/55 text-[10px] font-heading tracking-widest">
                  ALL FIELDS MARKED * ARE REQUIRED
                </p>
                <motion.button
                  type="submit"
                  disabled={isFormDisabled ? true : loading}
                  whileHover={{ scale: loading ? 1 : 1.03 }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden bg-[#38bdf8] text-[#0a0a0a] font-display tracking-widest text-sm px-8 py-3 rounded-lg hover:bg-[#7dd3fc] transition-colors duration-200 shadow-lg shadow-[#38bdf8]/20 group disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ letterSpacing: "0.1em" }}
                >
                  <span className="relative z-10">
                    {isFormDisabled
                      ? "COMING SOON"
                      : loading
                        ? "SUBMITTING..."
                        : "SUBMIT APPLICATION"}
                  </span>
                  {!loading && (
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
