'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { en } from './en'
import { fr } from './fr'
import { DEFAULT_LOCALE, LOCALES, type Dictionary, type Locale } from './types'

const STORAGE_KEY = 'timesheet:locale'

const dictionaries: Record<Locale, Dictionary> = { en, fr }

type PathsToStringProps<T> = T extends string
  ? []
  : { [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>] }[Extract<keyof T, string>]

type Join<T extends string[]> = T extends [infer F extends string, ...infer R extends string[]]
  ? R['length'] extends 0
    ? F
    : `${F}.${Join<R>}`
  : never

export type TKey = Join<PathsToStringProps<Dictionary>>

function resolve(dict: Dictionary, path: string): string {
  return path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], dict) as string
}

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match))
}

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TKey, vars?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    const initial = LOCALES.includes(stored as Locale) ? (stored as Locale) : DEFAULT_LOCALE
    setLocaleState(initial)
    document.documentElement.lang = initial
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
    document.documentElement.lang = next
  }, [])

  const dictionary = useMemo(() => dictionaries[locale], [locale])

  const t = useCallback(
    (key: TKey, vars?: Record<string, string | number>) => interpolate(resolve(dictionary, key), vars),
    [dictionary]
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

function useLocaleContext() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale/useT must be used within a LocaleProvider')
  return ctx
}

export function useLocale() {
  const { locale, setLocale } = useLocaleContext()
  return { locale, setLocale }
}

export function useT() {
  return useLocaleContext().t
}
