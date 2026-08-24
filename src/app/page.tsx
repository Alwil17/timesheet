import { MarketingNavbar } from '@/components/marketing/Navbar'
import { MarketingHero }   from '@/components/marketing/Hero'
import { ProblemStrip }    from '@/components/marketing/ProblemStrip'
import { Features }        from '@/components/marketing/Features'
import { HowItWorks }      from '@/components/marketing/HowItWorks'
import { Testimonials }    from '@/components/marketing/Testimonials'
import { FinalCTA }        from '@/components/marketing/FinalCTA'
import { MarketingFooter } from '@/components/marketing/Footer'

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <MarketingNavbar />
      <main>
        <MarketingHero />
        <ProblemStrip />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FinalCTA />
      </main>
      <MarketingFooter />
    </div>
  )
}
