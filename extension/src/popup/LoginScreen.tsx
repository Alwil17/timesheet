import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    onLoggedIn()
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h1 style={{ fontSize: 16, margin: 0 }}>⏱ Timesheet</h1>
      <label htmlFor="ext-email" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Email</label>
      <input
        id="ext-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
      />
      <label htmlFor="ext-password" style={{ fontSize: 12, color: 'var(--text-muted)' }}>Password</label>
      <input
        id="ext-password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
      />
      {error && (
        <p role="alert" style={{ color: 'var(--error)', fontSize: 12, margin: 0 }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '8px 12px',
          borderRadius: 8,
          border: 'none',
          background: 'var(--accent-green)',
          color: 'white',
          fontWeight: 600,
          cursor: loading ? 'default' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
