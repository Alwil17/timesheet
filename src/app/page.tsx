import type { Metadata } from 'next'
import { MarketingNavbar } from '@/components/marketing/Navbar'
import { MarketingHero }   from '@/components/marketing/Hero'
import { ProblemStrip }    from '@/components/marketing/ProblemStrip'
import { Features }        from '@/components/marketing/Features'
import { HowItWorks }      from '@/components/marketing/HowItWorks'
import { Testimonials }    from '@/components/marketing/Testimonials'
import { FAQ }              from '@/components/marketing/FAQ'
import { FinalCTA }        from '@/components/marketing/FinalCTA'
import { MarketingFooter } from '@/components/marketing/Footer'
import { StructuredData }  from '@/components/marketing/StructuredData'

export const metadata: Metadata = {
  title: 'Timesheet — Time tracking for freelancers and small agencies',
  description:
    'Track time across every client with a one-click timer, per-project rates, tags, and CSV/PDF export. Free forever, no credit card.',
  alternates: {
    canonical: '/',
  },
}

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <StructuredData />
      <MarketingNavbar />
      <main>
        <MarketingHero />
        <ProblemStrip />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <MarketingFooter />
    </div>
  )
}
