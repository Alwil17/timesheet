export function FinalCTA() {
  return (
    <section className="relative py-20 sm:py-28 bg-green-600 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-green-300 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-5 sm:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-5 leading-tight">
          Stop guessing.
          <br className="sm:hidden" /> Start billing.
        </h2>
        <p className="text-lg text-green-50 mb-8 max-w-xl mx-auto">
          Start tracking your time today. Free forever, no credit card.
        </p>
        <a
          href="/auth?mode=signup"
          className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-green-700 bg-white hover:bg-green-50 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
        >
          Create free account
        </a>
      </div>
    </section>
  )
}
