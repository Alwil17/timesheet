'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Mode = 'login' | 'signup'

interface FieldErrors {
  fullName?: string
  email?: string
  password?: string
  confirm?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(mode: Mode, fullName: string, email: string, password: string, confirm: string): FieldErrors {
  const errors: FieldErrors = {}

  if (mode === 'signup') {
    if (!fullName.trim()) errors.fullName = 'Full name is required.'
    else if (fullName.trim().length < 2) errors.fullName = 'Must be at least 2 characters.'
  }

  if (!email.trim()) errors.email = 'Email is required.'
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.'

  if (!password) errors.password = 'Password is required.'
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
  else if (!/[A-Z]/.test(password)) errors.password = 'Must contain at least one uppercase letter.'
  else if (!/[0-9]/.test(password)) errors.password = 'Must contain at least one number.'

  if (mode === 'signup' && password !== confirm) errors.confirm = 'Passwords do not match.'

  return errors
}

export default function AuthPage() {
  const router = useRouter()
  const [mode,      setMode]     = useState<Mode>('login')
  const [email,     setEmail]    = useState('')
  const [password,  setPassword] = useState('')
  const [confirm,   setConfirm]  = useState('')
  const [fullName,  setFullName] = useState('')
  const [loading,   setLoading]  = useState(false)
  const [error,     setError]    = useState<string | null>(null)
  const [message,   setMessage]  = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [touched,   setTouched]  = useState<Set<string>>(new Set())

  const touch = (field: string) => setTouched((prev) => new Set(prev).add(field))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    const errors = validate(mode, fullName, email, password, confirm)
    setFieldErrors(errors)
    setTouched(new Set(['fullName', 'email', 'password', 'confirm']))
    if (Object.keys(errors).length > 0) return

    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        })
        if (signUpError) throw signUpError
        setMessage('Account created! Check your email to confirm, then log in.')
        setMode('login')
        setPassword('')
        setConfirm('')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        router.push('/')
        router.refresh()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
        <div className="text-center">
          <p className="text-3xl mb-2">⏱</p>
          <h1 className="text-2xl font-bold text-gray-900">Timesheet</h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => touch('fullName')}
                placeholder="John Doe"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  touched.has('fullName') && fieldErrors.fullName ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {touched.has('fullName') && fieldErrors.fullName && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.fullName}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => touch('email')}
              placeholder="you@example.com"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                touched.has('email') && fieldErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {touched.has('email') && fieldErrors.email && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => touch('password')}
              placeholder="••••••••"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                touched.has('password') && fieldErrors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {touched.has('password') && fieldErrors.password && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
            )}
            {mode === 'signup' && !fieldErrors.password && (
              <p className="text-xs text-gray-400 mt-1">Min. 8 characters, 1 uppercase, 1 number.</p>
            )}
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => touch('confirm')}
                placeholder="••••••••"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  touched.has('confirm') && fieldErrors.confirm ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {touched.has('confirm') && fieldErrors.confirm && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.confirm}</p>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {loading ? '…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setError(null)
              setMessage(null)
              setFieldErrors({})
              setTouched(new Set())
              setPassword('')
              setConfirm('')
            }}
            className="text-brand-600 font-medium hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
