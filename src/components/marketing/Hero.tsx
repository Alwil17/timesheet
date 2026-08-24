'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Search, Plus, Clock } from 'lucide-react'

function TimerMock() {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [running, setRunning] = useState(true)
  const [secs, setSecs] = useState(8423)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dx = (e.clientX - cx) / r.width
      const dy = (e.clientY - cy) / r.height
      setTilt({ x: dy * -6, y: dx * 8 })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div
      ref={ref}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
      className="relative transition-transform duration-200 ease-out"
    >
      <div className="absolute -inset-6 bg-green-500/20 blur-3xl rounded-full" />

      <div className="relative bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200/80 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <span className="text-[11px] font-medium text-slate-400 tracking-wide">
            timesheet.app
          </span>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">
                Tracking
              </span>
            </div>
            <span className="text-xs text-slate-400">Today</span>
          </div>

          <div className="font-mono text-5xl font-bold text-slate-900 tabular-nums tracking-tight mb-1">
            {pad(h)}:{pad(m)}:{pad(s)}
          </div>
          <div className="text-sm text-slate-500 mb-5">
            Acme Corp · Website Redesign
          </div>

          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 mb-3 border border-slate-100">
            <Search className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400 flex-1">
              Search projects…
            </span>
            <span className="text-[10px] font-medium text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              ⌘K
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 mb-5 border border-slate-100">
            <Plus className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-500 flex-1">
              Drafting homepage hero copy…
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setRunning((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                running
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-600/30'
              }`}
            >
              {running ? (
                <>
                  <Pause className="w-4 h-4" /> Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Start
                </>
              )}
            </button>
            <div className="flex-1 text-right">
              <div className="text-xs text-slate-400">Billable rate</div>
              <div className="text-sm font-semibold text-slate-700">
                $150/hr
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl shadow-slate-900/10 border border-slate-200/80 px-4 py-3 items-center gap-3 hidden sm:flex">
        <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
          <Clock className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <div className="text-xs text-slate-400">This week</div>
          <div className="text-sm font-bold text-slate-900">28h 42m</div>
        </div>
      </div>
    </div>
  )
}

export function MarketingHero() {
  return (
    <section id="top" className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-green-50/40 via-white to-white" />
      <div className="absolute top-20 -right-32 w-96 h-96 bg-green-200/30 rounded-full blur-3xl -z-10" />
      <div className="absolute top-40 -left-32 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200/60 text-xs font-semibold text-green-700 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Built for freelancers & small agencies
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05] mb-5">
            Track time across every client.
            <span className="text-green-600"> No spreadsheets.</span>
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
            One-click timer, everything billable in one place. Stop losing hours
            between tabs and start invoicing what you actually worked.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/auth?mode=signup"
              className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-600/25 transition-all hover:shadow-xl hover:shadow-green-600/30 hover:-translate-y-0.5"
            >
              Sign up free
            </a>
            <a
              href="/auth"
              className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
            >
              Sign in
            </a>
          </div>

          <div className="mt-8 flex items-center gap-5 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> No
              credit card
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Free
              forever
            </span>
          </div>
        </div>

        <div className="relative lg:pl-8">
          <TimerMock />
        </div>
      </div>
    </section>
  )
}
