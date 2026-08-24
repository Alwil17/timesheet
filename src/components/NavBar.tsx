'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { TimerBadge } from './TimerBadge'
import { LanguageSwitcher } from './LanguageSwitcher'
import { supabase } from '@/lib/supabase'
import { useT } from '@/i18n/LocaleProvider'

export function NavBar() {
  const pathname = usePathname()
  const router   = useRouter()
  const t        = useT()

  const links = [
    { href: '/dashboard', label: t('nav.dashboard') },
    { href: '/clients',   label: t('nav.clients') },
    { href: '/projects',  label: t('nav.projects') },
    { href: '/entries',   label: t('nav.entries') },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace('/auth')
  }

  // Don't render the nav on the auth page
  if (pathname === '/auth') return null

  return (
    <nav className="bg-white border-b border-gray-200 px-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <span className="font-bold text-brand-600 text-lg tracking-tight">⏱ {t('nav.brand')}</span>
          <div className="flex gap-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'px-3 py-1.5 rounded text-sm font-medium transition-colors',
                  pathname === href
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TimerBadge />
          <LanguageSwitcher />
          <button
            onClick={handleSignOut}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            {t('nav.signOut')}
          </button>
        </div>
      </div>
    </nav>
  )
}
