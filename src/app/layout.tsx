import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers }      from './providers'
import { AuthGuard }      from '@/components/AuthGuard'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'

export const metadata: Metadata = {
  title:       'Timesheet',
  description: 'Multi-client timesheet tracker',
  manifest:    '/manifest.webmanifest',
  icons: {
    icon:             '/icon.svg',
    apple:            '/icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#16a34a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <ServiceWorkerRegister />
        <Providers>
          <AuthGuard>{children}</AuthGuard>
        </Providers>
      </body>
    </html>
  )
}
