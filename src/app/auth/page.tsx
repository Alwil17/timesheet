'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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

const inputClass = (invalid: boolean) =>
  `w-full border rounded-xl px-3.5 py-2.5 text-sm text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
    invalid ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
  }`

const perks = [
  'One-click timer across every client',
  'CSV & PDF export for invoicing',
  'Free forever, no credit card',
]

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
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('auth.genericError'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Branded panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-brand-600 to-brand-700 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 bg-emerald-300/10 rounded-full blur-3xl" />

        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="bg-white/95 rounded-lg p-1 flex items-center justify-center shrink-0">
            <Image src="/logo.png" alt="" width={28} height={28} />
          </span>
          <span className="text-lg font-bold text-white tracking-tight">Timesheet</span>
        </Link>

        <div className="relative">
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Track time across every client.
            <br />No spreadsheets.
          </h2>
          <ul className="space-y-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2.5 text-brand-50 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-brand-100">
          © {new Date().getFullYear()} Timesheet
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 lg:justify-end">
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <Image src="/logo.png" alt="Timesheet" width={28} height={28} />
            <span className="font-bold text-gray-900">Timesheet</span>
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="flex-1 flex items-center justify-center px-4 pb-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{t('auth.title')}</h1>
              <p className="text-sm text-gray-500 mt-1.5">
                {mode === 'login' ? t('auth.signInSubtitle') : t('auth.signUpSubtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label htmlFor="auth-full-name" className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.fullName')}</label>
                  <input
                    id="auth-full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onBlur={() => touch('fullName')}
                    placeholder={t('auth.fullNamePlaceholder')}
                    aria-invalid={touched.has('fullName') && !!fieldErrors.fullName}
                    className={inputClass(touched.has('fullName') && !!fieldErrors.fullName)}
                  />
                  {touched.has('fullName') && fieldErrors.fullName && (
                    <p role="alert" className="text-xs text-red-500 mt-1">{fieldErrors.fullName}</p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.email')}</label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => touch('email')}
                  placeholder={t('auth.emailPlaceholder')}
                  aria-invalid={touched.has('email') && !!fieldErrors.email}
                  className={inputClass(touched.has('email') && !!fieldErrors.email)}
                />
                {touched.has('email') && fieldErrors.email && (
                  <p role="alert" className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="auth-password" className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.password')}</label>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => touch('password')}
                  placeholder="••••••••"
                  aria-invalid={touched.has('password') && !!fieldErrors.password}
                  className={inputClass(touched.has('password') && !!fieldErrors.password)}
                />
                {touched.has('password') && fieldErrors.password && (
                  <p role="alert" className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                )}
                {mode === 'signup' && !fieldErrors.password && (
                  <p className="text-xs text-gray-400 mt-1">{t('auth.passwordHint')}</p>
                )}
              </div>

              {mode === 'signup' && (
                <div>
                  <label htmlFor="auth-confirm-password" className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.confirmPassword')}</label>
                  <input
                    id="auth-confirm-password"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onBlur={() => touch('confirm')}
                    placeholder="••••••••"
                    aria-invalid={touched.has('confirm') && !!fieldErrors.confirm}
                    className={inputClass(touched.has('confirm') && !!fieldErrors.confirm)}
                  />
                  {touched.has('confirm') && fieldErrors.confirm && (
                    <p role="alert" className="text-xs text-red-500 mt-1">{fieldErrors.confirm}</p>
                  )}
                </div>
              )}

              {error && (
                <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                  {error}
                </p>
              )}
              {message && (
                <p role="alert" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3.5 py-2.5">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-brand-600/25 transition-all hover:shadow-xl hover:shadow-brand-600/30 disabled:opacity-50 disabled:hover:shadow-lg"
              >
                {loading
                  ? (mode === 'login' ? t('auth.signingIn') : t('auth.creatingAccount'))
                  : (mode === 'login' ? t('auth.signIn') : t('auth.createAccount'))}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
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
                className="text-brand-600 font-semibold hover:text-brand-700 hover:underline"
              >
                {mode === 'login' ? t('auth.signUp') : t('auth.signIn')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
