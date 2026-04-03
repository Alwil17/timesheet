import type { Metadata } from 'next'
import './globals.css'
import { Providers }      from './providers'
import { NavBar }         from '@/components/NavBar'
import { AuthGuard }      from '@/components/AuthGuard'
import { StaleTimerBanner } from '@/components/StaleTimerBanner'

export const metadata: Metadata = {
  title:       'Timesheet',
  description: 'Multi-client timesheet tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Providers>
          <AuthGuard>
            <NavBar />
            <div className="max-w-5xl mx-auto px-4 pt-4">
              <StaleTimerBanner />
            </div>
            <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  )
}
