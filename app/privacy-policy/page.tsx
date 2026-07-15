import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Reveal } from "@/components/motion";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for MUNSoC NITJ - how we collect, use, and protect your personal information.",
  alternates: {
    canonical: "https://munsoc.opensourcenitj.com/privacy-policy",
  },
};

const sections = [
  {
    title: "Information We Collect",
    content: `When you submit an application or contact form on this website, we collect personal information you voluntarily provide, including your name, university email address, year of study, department, and any information included in your statement of purpose or MUN experience fields.

We do not collect payment information, government identification, or any sensitive personal data.`,
  },
  {
    title: "How We Use Your Information",
    content: `Information you submit is used solely for the following purposes:

• To process your membership application for MUNSoC NITJ
• To communicate with you regarding your application status, events, and society updates
• To maintain internal records of society membership
• To send notifications about upcoming conferences, workshops, and MUNSoC activities

We will never sell, rent, or trade your personal information to any third party.`,
  },
  {
    title: "Data Storage and Security",
    content: `Application data submitted through this website is transmitted via a third-party email service provider, and delivered to MUNSoC NITJ's official email address. We take reasonable precautions to protect your information, but no internet transmission is 100% secure.

We retain your data only as long as is reasonably necessary for the purposes described in this policy.`,
  },
  {
    title: "Cookies and Analytics",
    content: `This website uses third-party analytics services to understand aggregate traffic and usage patterns. This service does not use cookies and does not collect personally identifiable information. No tracking cookies are placed on your device when you visit this site.`,
  },
  {
    title: "Third-Party Links",
    content: `This website contains links to external sites such as Instagram, WhatsApp, and the university portal. We are not responsible for the privacy practices of these external services and encourage you to review their respective privacy policies.`,
  },
  {
    title: "Your Rights",
    content: `You may request that we correct or delete any personal information we hold about you by contacting us at the email address below. We will respond to such requests within a reasonable timeframe.`,
  },
  {
    title: "Changes to This Policy",
    content: `MUNSoC NITJ reserves the right to update this Privacy Policy at any time. Changes will be posted on this page with an updated effective date. Continued use of this website after any changes constitutes acceptance of the revised policy.`,
  },
  {
    title: "Contact Us",
    content: `If you have any questions about this Privacy Policy or how we handle your data, please contact us:

MUNSoC - Model United Nations Society
Dr. B.R. Ambedkar National Institute of Technology Jalandhar
Student Activity Cabin, NIT Jalandhar, Punjab - 144008

Instagram: @nitjmunsociety`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <Navbar />

      <section className="relative pt-32 pb-16 px-4 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden">
          <span
            className="font-heading font-bold text-white/[0.025] tracking-tighter whitespace-nowrap"
            style={{ fontSize: "clamp(5rem, 18vw, 13rem)" }}
            aria-hidden
          >
            PRIVACY
          </span>
        </div>
        <Reveal className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="inline-block border border-white/10 text-white/60 text-[10px] font-heading tracking-[0.2em] px-3 py-1 rounded-sm mb-5">
            LEGAL
          </div>
          <h1
            className="font-display text-white text-balance"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              letterSpacing: "0.04em",
            }}
          >
            PRIVACY POLICY
          </h1>
          <p className="mt-4 text-white/70 text-sm leading-relaxed text-pretty max-w-lg mx-auto">
            MUNSoC NITJ is committed to protecting your personal information and
            your right to privacy.
          </p>
          <p className="mt-3 text-white/55 text-xs font-heading tracking-widest">
            EFFECTIVE DATE: JUNE 2026
          </p>
        </Reveal>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          
          <Reveal>
            <p className="text-white/70 text-sm leading-relaxed mb-14 text-pretty border-l-2 border-[#38bdf8]/40 pl-5">
              This Privacy Policy describes how MUNSoC NITJ (&ldquo;we&rdquo;,
              &ldquo;our&rdquo;, or &ldquo;the society&rdquo;) collects, uses,
              and protects information you provide when you interact with our
              website at{" "}
              <span className="text-[#38bdf8]">munsoc.opensourcenitj.com</span>.
              By using this site, you agree to the terms of this policy.
            </p>
          </Reveal>

          <div className="flex flex-col gap-12">
            {sections.map((section, i) => (
              <Reveal key={section.title} delay={i * 0.04}>
                <div className="group">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-[#38bdf8]/40 text-[10px] font-heading tracking-widest mt-1 w-6 shrink-0 text-right">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2
                      className="font-display text-white"
                      style={{
                        fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {section.title.toUpperCase()}
                    </h2>
                  </div>
                  <div className="ml-10 border-l border-white/6 pl-6">
                    <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line text-pretty">
                      {section.content}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="mt-16 pt-10 border-t border-white/8 text-center">
              <p className="text-white/55 text-xs font-heading tracking-widest">
                &copy; 2026 MUNSOC NIT JALANDHAR &nbsp;&middot;&nbsp; ALL RIGHTS
                RESERVED
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
