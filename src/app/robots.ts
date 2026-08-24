import type { MetadataRoute } from 'next'

const SITE_URL = 'https://timesheet-zeta-rosy.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/clients', '/projects', '/entries', '/auth'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
