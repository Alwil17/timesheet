import { enUS, fr } from 'date-fns/locale'
import type { Locale as DateFnsLocale } from 'date-fns'
import type { Locale } from './types'

export const dateLocales: Record<Locale, DateFnsLocale> = { en: enUS, fr }
