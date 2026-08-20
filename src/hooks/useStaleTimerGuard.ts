/**
 * useStaleTimerGuard
 *
 * Runs on mount and every minute thereafter.
 * – Calls the DB function to auto-stop entries older than MAX_TIMER_HOURS
 * – Exposes `isWarning` (running > WARN_TIMER_HOURS) for the UI banner
 * – Auto-stops the local store entry once MAX_TIMER_HOURS is exceeded
 */
import { useEffect, useState } from 'react'
import { useQueryClient }      from '@tanstack/react-query'
import { autoStopStaleTimers, MAX_TIMER_HOURS, WARN_TIMER_HOURS } from '@/services/staleTimer'
import { useTimerStore }       from '@/store/timerStore'
import { entryKeys }           from './useTimeEntries'
import { supabase }            from '@/lib/supabase'

const HOURS_MS = (h: number) => h * 60 * 60 * 1000

export function useStaleTimerGuard() {
  const qc           = useQueryClient()
  const running      = useTimerStore((s) => s.running)
  const clearRunning = useTimerStore((s) => s.clearRunning)
  const [isWarning, setIsWarning]   = useState(false)
  const [autoStopped, setAutoStopped] = useState(false)

  const markAutoStopped = () => {
    clearRunning()
    qc.invalidateQueries({ queryKey: entryKeys.all })
    qc.invalidateQueries({ queryKey: entryKeys.running })
    setAutoStopped(true)
  }

  // On mount: purge any stale timers in the DB (handles the case where the
  // user closed the browser without stopping their timer)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      autoStopStaleTimers().then((stopped) => {
        if (stopped.length > 0) markAutoStopped()
      }).catch(console.error)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Every minute: check the running timer's age client-side
  useEffect(() => {
    if (!running) {
      setIsWarning(false)
      return
    }

    const check = () => {
      const elapsed = Date.now() - new Date(running.start_time).getTime()
      setIsWarning(elapsed >= HOURS_MS(WARN_TIMER_HOURS))

      if (elapsed >= HOURS_MS(MAX_TIMER_HOURS)) markAutoStopped()
    }

    check() // run immediately
    const id = setInterval(check, 60_000)
    return () => clearInterval(id)
  }, [running, clearRunning, qc])

  return { isWarning, autoStopped, dismissAutoStopped: () => setAutoStopped(false) }
}
