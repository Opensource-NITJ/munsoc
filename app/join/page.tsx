import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ApplicationForm from "@/components/join/application-form";
import JoinSidebar from "@/components/join/join-sidebar";
import { Reveal } from "@/components/motion";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Us",
  description:
    "Apply to become a member of MUNSoC NITJ and step into the world of global leadership, diplomacy, and debate.",
  alternates: {
    canonical: "https://munsoc.opensourcenitj.com/join",
  },
};

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <Navbar />

      <section className="pt-28 pb-12 px-4 bg-[#0a0a0a]">
        <Reveal className="max-w-5xl mx-auto">
          <h1
            className="font-display text-white leading-[0.95] text-balance"
            style={{
              fontSize: "clamp(2.2rem, 7vw, 5rem)",
              letterSpacing: "0.04em",
            }}
          >
            STEP INTO GLOBAL LEADERSHIP
          </h1>
          <p className="mt-4 text-white/70 text-sm sm:text-base leading-relaxed max-w-md">
            Join a community of diplomats, and future leaders.
          </p>
        </Reveal>
      </section>

      <section className="py-12 px-4 bg-[#121212]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <ApplicationForm />
          <JoinSidebar />
        </div>
      </section>

      <Footer />
    </main>
  );
}
