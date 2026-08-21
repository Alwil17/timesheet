import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { LoginScreen } from './LoginScreen'
import { TimerScreen } from './TimerScreen'

export function Popup() {
  const [session, setSession] = useState<'loading' | 'in' | 'out'>('loading')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ? 'in' : 'out')
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ? 'in' : 'out')
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (session === 'loading') {
    return <p style={{ padding: 16, fontSize: 13, color: '#6b7280' }}>Loading…</p>
  }

  return session === 'in' ? <TimerScreen /> : <LoginScreen onLoggedIn={() => setSession('in')} />
}
