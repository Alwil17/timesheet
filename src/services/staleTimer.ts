import { supabase } from '@/lib/supabase'

/** Maximum hours a timer is allowed to run before being auto-stopped. */
export const MAX_TIMER_HOURS = 8

/** Warning threshold in hours — banner appears after this duration. */
export const WARN_TIMER_HOURS = 4

/**
 * Calls the DB function that closes any running timer older than `maxHours`.
 * Returns the entries that were auto-stopped (may be empty).
 */
export const autoStopStaleTimers = async (maxHours = MAX_TIMER_HOURS) => {
  const { data, error } = await supabase.rpc('auto_stop_stale_timers', {
    max_hours: maxHours,
  })
  if (error) throw error
  return data ?? []
}
