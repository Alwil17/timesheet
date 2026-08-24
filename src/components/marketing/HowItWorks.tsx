import { Users, Timer, FileDown, type LucideIcon } from 'lucide-react'

const steps: { n: string; icon: LucideIcon; title: string; desc: string }[] = [
  {
    n: '01',
    icon: Users,
    title: 'Add your clients & projects',
    desc: 'Set up clients, projects, and hourly rates in minutes.',
  },
  {
    n: '02',
    icon: Timer,
    title: 'Start the timer as you work',
    desc: 'One click to track. Add a description, tag it, keep going.',
  },
  {
    n: '03',
    icon: FileDown,
    title: 'Export or invoice from your entries',
    desc: 'Pull a CSV or print/PDF and send the invoice.',
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="py-20 sm:py-28 bg-slate-50/50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-14">
          <div className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">
            How it works
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Three steps from clock-in to invoice.
          </h2>
        </div>

        <div className="relative grid md:grid-cols-3 gap-8 md:gap-6">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-green-200 via-green-400 to-green-200" />

          {steps.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="relative">
                <div className="flex flex-col items-start">
                  <div className="relative w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-5">
                    <Icon className="w-9 h-9 text-green-600" strokeWidth={1.75} />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center shadow-md shadow-green-600/30">
                      {i + 1}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-semibold text-green-600 mb-1">
                    {s.n}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
