import { Timer, Users, Tag, FileDown, Puzzle, BellRing, type LucideIcon } from 'lucide-react'

const features: { icon: LucideIcon; title: string; desc: string; wide?: boolean }[] = [
  {
    icon: Timer,
    title: 'One-click timer',
    desc: 'Start/stop tracking instantly, with project search and description autocomplete.',
    wide: true,
  },
  {
    icon: Users,
    title: 'Multi-client, multi-project',
    desc: 'Organize time by client and project, with hourly rates per project.',
  },
  {
    icon: Tag,
    title: 'Tags',
    desc: 'Label entries for deeper reporting — billable/non-billable, categories.',
  },
  {
    icon: FileDown,
    title: 'CSV export & print/PDF',
    desc: 'Pull entries out for invoicing in one click.',
  },
  {
    icon: Puzzle,
    title: 'Browser extension',
    desc: 'Start/stop timers from any tab, keyboard shortcut, idle detection, dark mode.',
  },
  {
    icon: BellRing,
    title: 'Never forget to track',
    desc: 'Smart reminder nudges you during work hours if no timer is running.',
  },
]

function FeatureCard({ f }: { f: (typeof features)[number] }) {
  const Icon = f.icon
  return (
    <div
      className={`group relative bg-white rounded-xl p-6 border border-slate-200/70 shadow-sm hover:shadow-lg hover:border-green-200 transition-all duration-300 overflow-hidden ${
        f.wide ? 'md:col-span-2' : ''
      }`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent" />
      </div>
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4 group-hover:bg-green-100 group-hover:scale-105 transition-all">
          <Icon className="w-6 h-6 text-green-600" strokeWidth={1.75} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1.5">
          {f.title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
      </div>
    </div>
  )
}

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-12">
          <div className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">
            Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Everything you need to bill for your time.
          </h2>
          <p className="text-lg text-slate-600">
            Built for the way freelancers actually work — fast, flexible, and
            out of your way.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FeatureCard key={i} f={f} />
          ))}
        </div>
      </div>
    </section>
  )
}
