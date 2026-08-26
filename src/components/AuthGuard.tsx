'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useT } from '@/i18n/LocaleProvider'
import { NavBar } from './NavBar'
import { StaleTimerBanner } from './StaleTimerBanner'

// The marketing page ("/") and the auth pages are public — they render
// as-is regardless of session state and own their own layout/chrome.
const PUBLIC_PATHS = ['/', '/auth', '/auth/reset-password']

// Password recovery lands here with a real (recovery) session already
// active — unlike the other public paths, an existing session must NOT
// bounce the user to /dashboard, or they'd never get to set a new password.
const NO_SESSION_REDIRECT_PATHS = ['/auth/reset-password']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const t        = useT()
  const [ready, setReady] = useState(false)
  const isPublic = PUBLIC_PATHS.includes(pathname)
  const skipSessionRedirect = NO_SESSION_REDIRECT_PATHS.includes(pathname)

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !isPublic) {
        router.replace('/auth')
      } else if (session && isPublic && !skipSessionRedirect) {
        router.replace('/dashboard')
      } else {
        setReady(true)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !isPublic) {
        router.replace('/auth')
      } else if (session && isPublic && !skipSessionRedirect) {
        router.replace('/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, pathname, isPublic, skipSessionRedirect])

  // Public pages always render, no app chrome
  if (isPublic) return <>{children}</>

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        {t('common.loading')}
      </div>
    )
  }

  return (
    <>
      <NavBar />
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <StaleTimerBanner />
      </div>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </>
  )
}
