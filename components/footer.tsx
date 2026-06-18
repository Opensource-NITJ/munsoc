import Image from "next/image";
import Link from "next/link";
import { MapPin, ExternalLink, MessageCircle } from "lucide-react";

const InstagramIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline mr-1"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
);

const LinkedInIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline mr-1"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-13h4v2a4 4 0 0 1 2-2z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/join", label: "Join Us" },
  { href: "/join#contact", label: "Contact Info" },
  {
    href: "https://instagram.com/nitjmunsociety",
    label: "Instagram",
    icon: <InstagramIcon />,
    external: true,
  },
  {
    href: "https://chat.whatsapp.com/IFbG2gOm3gvHSB5Vi4sIr5",
    label: "WhatsApp Community",
    icon: <MessageCircle size={13} className="inline mr-1" />,
    external: true,
  },
  {
    href: "https://www.linkedin.com/company/munsoc-nitj",
    label: "LinkedIn",
    icon: <LinkedInIcon />,
    external: true,
  },
  { href: "/privacy-policy", label: "Privacy Policy" },
  {
    href: "https://nitj.ac.in",
    label: "University Portal",
    icon: <ExternalLink size={13} className="inline mr-1" />,
    external: true,
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0d0d0d] border-t border-white/5 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-10 justify-between">
          <div className="max-w-xs">
            <Image
              src="/munsoc-white-blue.svg"
              alt="MUNSoC NITJ"
              width={44}
              height={44}
              className="h-10 w-10 object-contain mb-3 transition-transform duration-300 hover:scale-110 hover:-rotate-2"
            />
            <p className="text-white/70 text-xs leading-relaxed">
              Empowering students through debate, diplomacy, and global
              awareness at Dr. B.R. Ambedkar National Institute of Technology
              Jalandhar.
            </p>
            <div className="flex items-center gap-1.5 mt-4 text-white/60 text-xs">
              <MapPin size={12} />
              <span>Jalandhar, Punjab</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="text-white/70 hover:text-[#38bdf8] text-xs transition-colors duration-200 flex items-center hover:-translate-y-0.5"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>
            <p className="text-white/55 text-xs">
              &copy; 2026 MUNSoC NIT Jalandhar. All rights reserved. Affiliated
              with Dr. B.R. Ambedkar National Institute of Technology.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-2 text-white/50 text-xs">
          <span>MUNSoC NITJ - Student Activity Cabin, NIT Jalandhar</span>
          <span>Need help? Swing by the Student Activity Cabin!</span>
        </div>
      </div>
    </footer>
  );
}
