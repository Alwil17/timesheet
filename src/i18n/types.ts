import type { en } from './en'

export type Locale = 'en' | 'fr'

type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> }

/** Same nested shape as `en`, but with literal string types widened to `string`
 *  so `fr.ts` can supply different text while still being shape-checked against `en`. */
export type Dictionary = Widen<typeof en>

export const LOCALES: Locale[] = ['en', 'fr']
export const DEFAULT_LOCALE: Locale = 'en'
