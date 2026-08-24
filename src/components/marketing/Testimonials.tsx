import { Star } from 'lucide-react'

const testimonials = [
  {
    quote:
      "I billed 12 extra hours my first month — hours I would've forgotten entirely. The timer just lives in my browser now.",
    name: 'Maya R.',
    role: 'Freelance designer',
  },
  {
    quote:
      'Tracking across four clients used to mean four spreadsheets. Now it\'s one tab and a CSV export before invoicing.',
    name: 'David L.',
    role: 'Independent consultant',
  },
  {
    quote:
      "The reminder nudges caught me working untracked more times than I'd like to admit. Worth it for that alone.",
    name: 'Sofia M.',
    role: 'Marketing freelancer',
  },
]

export function Testimonials() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">
            Loved by freelancers
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Time tracked, revenue captured.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 border border-slate-200/70 shadow-sm flex flex-col"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 fill-green-500 text-green-500"
                  />
                ))}
              </div>
              <p className="text-slate-700 leading-relaxed mb-6 flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-700">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {t.name}
                  </div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur border border-slate-200 text-sm font-medium text-slate-600">
            <span className="text-base">🌐</span>
            Available in English &amp; French
          </span>
        </div>
      </div>
    </section>
  )
}
