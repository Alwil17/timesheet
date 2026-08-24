import Image from 'next/image'

export function MarketingFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="grid sm:grid-cols-3 gap-8 items-start">
          <div>
            <a href="#top" className="flex items-center gap-2 mb-3">
              <Image src="/logo.png" alt="Timesheet" width={32} height={32} />
              <span className="text-base font-bold text-white">Timesheet</span>
            </a>
            <p className="text-sm text-slate-500 max-w-xs">
              Time tracking for freelancers and small agencies who bill by the
              hour.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Product
            </span>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#how" className="hover:text-white transition-colors">
              How it works
            </a>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Account
            </span>
            <a href="/auth" className="hover:text-white transition-colors">
              Sign in
            </a>
            <a
              href="/auth?mode=signup"
              className="hover:text-white transition-colors"
            >
              Sign up
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Timesheet. All rights reserved.
          </p>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur border border-white/10 text-xs font-medium text-slate-300">
            🌐 Available in English &amp; French
          </span>
        </div>
      </div>
    </footer>
  )
}
