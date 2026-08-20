'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useT, type TFunction } from '@/i18n/LocaleProvider'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

type Mode = 'login' | 'signup'

interface FieldErrors {
  fullName?: string
  email?: string
  password?: string
  confirm?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(t: TFunction, mode: Mode, fullName: string, email: string, password: string, confirm: string): FieldErrors {
  const errors: FieldErrors = {}

  if (mode === 'signup') {
    if (!fullName.trim()) errors.fullName = t('auth.errors.fullNameRequired')
    else if (fullName.trim().length < 2) errors.fullName = t('auth.errors.fullNameTooShort')
  }

  if (!email.trim()) errors.email = t('auth.errors.emailRequired')
  else if (!EMAIL_RE.test(email)) errors.email = t('auth.errors.emailInvalid')

  if (!password) errors.password = t('auth.errors.passwordRequired')
  else if (password.length < 8) errors.password = t('auth.errors.passwordTooShort')
  else if (!/[A-Z]/.test(password)) errors.password = t('auth.errors.passwordNeedsUpper')
  else if (!/[0-9]/.test(password)) errors.password = t('auth.errors.passwordNeedsNumber')

  if (mode === 'signup' && password !== confirm) errors.confirm = t('auth.errors.passwordMismatch')

  return errors
}

export default function AuthPage() {
  const router = useRouter()
  const t = useT()
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

    const errors = validate(t, mode, fullName, email, password, confirm)
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
        setMessage(t('auth.signUpSuccess'))
        setMode('login')
        setPassword('')
        setConfirm('')
        setLoading(false)
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        // Keep the button disabled until the redirect actually navigates away —
        // resetting loading here would let the user click it again mid-transition.
        router.push('/')
        router.refresh()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('auth.genericError'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>
        <div className="text-center">
          <p className="text-3xl mb-2">⏱</p>
          <h1 className="text-2xl font-bold text-gray-900">{t('auth.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'login' ? t('auth.signInSubtitle') : t('auth.signUpSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.fullName')}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => touch('fullName')}
                placeholder={t('auth.fullNamePlaceholder')}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => touch('email')}
              placeholder={t('auth.emailPlaceholder')}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                touched.has('email') && fieldErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {touched.has('email') && fieldErrors.email && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
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
              <p className="text-xs text-gray-400 mt-1">{t('auth.passwordHint')}</p>
            )}
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.confirmPassword')}</label>
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
            {loading
              ? (mode === 'login' ? t('auth.signingIn') : t('auth.creatingAccount'))
              : (mode === 'login' ? t('auth.signIn') : t('auth.createAccount'))}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          {mode === 'login' ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
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
            {mode === 'login' ? t('auth.signUp') : t('auth.signIn')}
          </button>
        </p>
      </div>
    </div>
  )
}
