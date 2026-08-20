'use client'

import clsx from 'clsx'
import { LOCALES } from '@/i18n/types'
import { useLocale } from '@/i18n/LocaleProvider'

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()

  return (
    <div className="flex items-center gap-0.5 text-xs">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={clsx(
            'px-1.5 py-0.5 rounded font-medium transition-colors',
            locale === l ? 'bg-brand-50 text-brand-700' : 'text-gray-400 hover:text-gray-700'
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
