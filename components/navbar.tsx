'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

const navLinks = [
  { href: '/', label: 'HOME' },
  { href: '/about', label: 'ABOUT US' },
  { href: '/committees', label: 'COMMITTEES' },
  { href: '/join', label: 'JOIN US' },
]

const EASE = [0.22, 1, 0.36, 1] as const

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0d0d0d]/90 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/40'
          : 'bg-[#0d0d0d]/60 backdrop-blur-sm border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          <Link href="/" className="flex items-center shrink-0 group">
            <motion.div whileHover={{ scale: 1.08, rotate: -2 }} transition={{ duration: 0.3, ease: EASE }}>
              <Image
                src="/munsoc-white-blue.svg"
                alt="MUNSoC NITJ"
                width={40}
                height={40}
                className="h-9 w-9 object-contain"
                priority
              />
            </motion.div>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-xs font-heading font-semibold tracking-widest transition-colors duration-200 py-1 ${
                    isActive ? 'text-[#38bdf8]' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute left-0 -bottom-0.5 h-0.5 w-full bg-[#38bdf8] rounded-full"
                      transition={{ duration: 0.4, ease: EASE }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="hidden md:flex items-center">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
              <Link
                href="/join"
                className="border border-white/30 text-white text-xs font-heading font-semibold tracking-widest px-4 py-1.5 rounded hover:border-[#38bdf8] hover:text-[#38bdf8] hover:bg-[#38bdf8]/5 transition-colors duration-200"
              >
                COMING SOON
              </Link>
            </motion.div>
          </div>

          <button
            className="md:hidden text-white/70 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="md:hidden overflow-hidden bg-[#0d0d0d] border-t border-white/5"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3, ease: EASE }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`text-sm font-heading font-semibold tracking-widest ${
                        isActive ? 'text-[#38bdf8]' : 'text-white/70'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                )
              })}
              <Link
                href="/join"
                onClick={() => setMobileOpen(false)}
                className="border border-white/30 text-white text-xs font-heading font-semibold tracking-widest px-4 py-2 rounded text-center hover:border-[#38bdf8] hover:text-[#38bdf8] transition-colors"
              >
                COMING SOON
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
