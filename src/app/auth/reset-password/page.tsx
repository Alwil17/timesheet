'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useT } from '@/i18n/LocaleProvider'

const inputClass = (invalid: boolean) =>
  `w-full border rounded-xl px-3.5 py-2.5 text-sm text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
    invalid ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
  }`

export default function ResetPasswordPage() {
  const router = useRouter()
  const t = useT()

  // Supabase parses the recovery token from the URL and fires this event
  // once a recovery session is established — until then we don't know if
  // the link is valid, so hold the form back.
  const [ready, setReady]     = useState(false)
  const [invalid, setInvalid] = useState(false)
  const readyRef = useRef(false)

  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)

  useEffect(() => {
    const markReady = () => {
      readyRef.current = true
      setReady(true)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) markReady()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) markReady()
    })

    // If no recovery session shows up shortly, the link was invalid/expired.
    const timer = setTimeout(() => {
      if (!readyRef.current) setInvalid(true)
    }, 4000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) return setError(t('auth.errors.passwordTooShort'))
    if (!/[A-Z]/.test(password)) return setError(t('auth.errors.passwordNeedsUpper'))
    if (!/[0-9]/.test(password)) return setError(t('auth.errors.passwordNeedsNumber'))
    if (password !== confirm) return setError(t('auth.errors.passwordMismatch'))

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => {
      router.push('/dashboard')
      router.refresh()
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1.5">{t('auth.resetPassword')}</h1>
        <p className="text-sm text-gray-500 mb-8">{t('auth.resetSubtitle')}</p>

        {invalid && !ready ? (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
            {t('auth.genericError')}
          </p>
        ) : !ready ? (
          <p className="text-sm text-gray-400">{t('common.loading')}</p>
        ) : done ? (
          <p role="alert" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3.5 py-2.5">
            {t('auth.resetSuccess')}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-password" className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.newPassword')}</label>
              <input
                id="reset-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass(false)}
              />
              <p className="text-xs text-gray-400 mt-1">{t('auth.passwordHint')}</p>
            </div>

            <div>
              <label htmlFor="reset-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">{t('auth.confirmPassword')}</label>
              <input
                id="reset-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className={inputClass(false)}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-brand-600/25 transition-all hover:shadow-xl hover:shadow-brand-600/30 disabled:opacity-50 disabled:hover:shadow-lg"
            >
              {loading ? t('auth.resettingPassword') : t('auth.resetPassword')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
