import { Clock, Table2, BellOff, type LucideIcon } from 'lucide-react'

const items: { pain: string; fix: string; icon: LucideIcon }[] = [
  {
    pain: 'Losing track of billable hours',
    fix: 'One-click timer captures every minute.',
    icon: Clock,
  },
  {
    pain: 'Juggling clients in spreadsheets',
    fix: 'Organize by client & project in one place.',
    icon: Table2,
  },
  {
    pain: 'Forgetting to start/stop timers',
    fix: 'Smart reminders nudge you during work hours.',
    icon: BellOff,
  },
]

export function ProblemStrip() {
  return (
    <section className="py-16 sm:py-20 border-y border-slate-100 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid md:grid-cols-3 gap-5">
          {items.map((it, i) => {
            const Icon = it.icon
            return (
              <div
                key={i}
                className="group bg-white rounded-xl p-6 border border-slate-200/70 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-green-50 transition-colors">
                    <Icon className="w-5 h-5 text-slate-500 group-hover:text-green-600 transition-colors" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-400 line-through mb-1">
                      {it.pain}
                    </div>
                    <div className="text-base font-semibold text-slate-900">
                      {it.fix}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
