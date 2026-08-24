import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers }      from './providers'
import { AuthGuard }      from '@/components/AuthGuard'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'

const SITE_URL = 'https://timesheet-zeta-rosy.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  'Timesheet — Time tracking for freelancers and small agencies',
    template: '%s · Timesheet',
  },
  description:
    'Track time across every client with a one-click timer, per-project rates, tags, and CSV/PDF export. Free forever, no credit card.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon:  '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    type:        'website',
    url:         SITE_URL,
    siteName:    'Timesheet',
    title:       'Timesheet — Time tracking for freelancers and small agencies',
    description:
      'Track time across every client with a one-click timer, per-project rates, tags, and CSV/PDF export.',
    images: [{ url: '/logo.png', width: 1234, height: 1234, alt: 'Timesheet' }],
  },
  twitter: {
    card:        'summary',
    title:       'Timesheet — Time tracking for freelancers and small agencies',
    description:
      'Track time across every client with a one-click timer, per-project rates, tags, and CSV/PDF export.',
    images: ['/logo.png'],
  },
  robots: {
    index:  true,
    follow: true,
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
