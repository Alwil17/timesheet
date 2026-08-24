const faqs = [
  {
    q: 'Is Timesheet free?',
    a: 'Yes. Timesheet is free forever for individual freelancers and small teams — no credit card required to sign up.',
  },
  {
    q: 'Can I track time for multiple clients and projects?',
    a: 'Yes. Organize time entries by client and project, each with its own hourly rate, and switch between them from a single timer.',
  },
  {
    q: 'Can I export my time entries for invoicing?',
    a: 'Yes. Export any date range to CSV, or print/save a PDF directly from the entries page.',
  },
  {
    q: 'Is there a browser extension?',
    a: 'Yes. The Timesheet browser extension lets you start and stop the timer from any tab, with a keyboard shortcut, idle detection, and dark mode support.',
  },
  {
    q: 'What happens if I forget to stop the timer?',
    a: 'Timesheet detects idle time and stale running timers, and sends a reminder if no timer is running during your usual work hours.',
  },
  {
    q: 'What languages does Timesheet support?',
    a: 'Timesheet is available in English and French.',
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-20 sm:py-28 bg-slate-50/50 border-y border-slate-100">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <div className="mb-12">
          <div className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Frequently asked questions.
          </h2>
        </div>

        <dl className="space-y-6">
          {faqs.map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-slate-200/70 shadow-sm">
              <dt className="text-base font-semibold text-slate-900 mb-1.5">{item.q}</dt>
              <dd className="text-sm text-slate-600 leading-relaxed">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export const faqItems = faqs
