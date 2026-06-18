'use client'

import { Globe, Mic, FileText, Mail, Info } from 'lucide-react'
import { Reveal } from '@/components/motion'

const benefits = [
  {
    icon: Globe,
    title: 'Global Networking',
    desc: 'Connect with delegates from premier institutions nationwide.',
  },
  {
    icon: Mic,
    title: 'Public Speaking Mastery',
    desc: 'Refine your oratory skills in high-stakes simulated UN committees.',
  },
  {
    icon: FileText,
    title: 'Advanced Research',
    desc: 'Develop critical analysis and policy drafting capabilities.',
  },
]

export default function JoinSidebar() {
  return (
    <div className="flex flex-col gap-4">
      
      <Reveal delay={0.1} className="bg-[#1c1c1e] border border-white/8 rounded-xl p-6">
        <h3 className="font-heading font-extrabold text-white tracking-wide text-lg mb-5">
          WHY JOIN US?
        </h3>
        <div className="flex flex-col gap-5">
          {benefits.map((b) => {
            const Icon = b.icon
            return (
              <div key={b.title} className="flex items-start gap-3 group">
                <span className="mt-0.5 shrink-0 text-[#38bdf8] transition-transform duration-300 group-hover:scale-110">
                  <Icon size={18} strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-white text-sm font-medium transition-colors duration-300 group-hover:text-[#38bdf8]">
                    {b.title}
                  </p>
                  <p className="text-white/60 text-xs leading-relaxed mt-0.5">{b.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Reveal>

      <Reveal delay={0.2} className="bg-[#1c1c1e] border border-white/8 rounded-xl p-6">
        <div id="contact" className="scroll-mt-24">
          <h3 className="font-heading font-extrabold text-white tracking-wide text-lg mb-5">
            CONTACT US
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <Mail size={16} strokeWidth={1.5} className="text-[#38bdf8] mt-0.5 shrink-0" />
              <a href="mailto:munsocnitj@gmail.com" className="text-white/70 text-sm hover:text-[#38bdf8] transition-colors">munsocnitj@gmail.com</a>
            </div>
            <div className="flex items-start gap-3">
              <Info size={16} strokeWidth={1.5} className="text-[#38bdf8] mt-0.5 shrink-0" />
              <p className="text-white/70 text-sm leading-relaxed">
                The official MUN Society cabin is situated at the student activity chamber, NIT
                Jalandhar. Drop by for queries!
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
