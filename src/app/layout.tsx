import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { NavBar }   from '@/components/NavBar'
import { AuthGuard } from '@/components/AuthGuard'

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
            <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  )
}
