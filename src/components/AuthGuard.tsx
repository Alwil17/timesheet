'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && pathname !== '/auth') {
        router.replace('/auth')
      } else {
        setReady(true)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && pathname !== '/auth') {
        router.replace('/auth')
      } else if (session && pathname === '/auth') {
        router.replace('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, pathname])

  // On the auth page itself, always render
  if (pathname === '/auth') return <>{children}</>

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Loading…
      </div>
    )
  }

  return <>{children}</>
}
