'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 group">
          <Image src="/logo.png" alt="Timesheet" width={36} height={36} className="group-hover:scale-105 transition-transform" />
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Timesheet
          </span>
        </a>

        <div className="hidden md:flex items-center gap-2">
          <a
            href="#features"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Features
          </a>
          <a
            href="#how"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            How it works
          </a>
          <a
            href="/auth"
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            Sign in
          </a>
          <a
            href="/auth?mode=signup"
            className="ml-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-sm shadow-green-600/25 transition-all hover:shadow-md hover:shadow-green-600/30"
          >
            Sign up free
          </a>
        </div>

        <button
          className="md:hidden p-2 -mr-2 text-slate-700"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-white border-t border-slate-200 px-5 py-4 space-y-1 shadow-lg">
          <a href="#features" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
            Features
          </a>
          <a href="#how" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
            How it works
          </a>
          <a href="/auth" className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Sign in
          </a>
          <a href="/auth?mode=signup" className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-green-600 text-center">
            Sign up free
          </a>
        </div>
      )}
    </header>
  )
}
