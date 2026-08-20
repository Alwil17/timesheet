/**
 * useIdleTimerGuard
 *
 * While a timer is running, tracks mouse/keyboard/touch activity and
 * auto-stops the timer once no activity has been seen for IDLE_TIMEOUT_MINUTES.
 * The stop is backdated to the last-active moment (not "now") so idle time
 * isn't counted toward the entry's duration.
 */
import { useEffect, useRef, useState } from 'react'
import { useQueryClient }      from '@tanstack/react-query'
import { useTimerStore }       from '@/store/timerStore'
import { entryKeys, useUpdateEntry } from './useTimeEntries'
import { IDLE_TIMEOUT_MINUTES } from '@/services/idleTimer'

const IDLE_MS = IDLE_TIMEOUT_MINUTES * 60_000
const POLL_MS = 30_000
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'] as const

export function useIdleTimerGuard() {
  const qc           = useQueryClient()
  const running      = useTimerStore((s) => s.running)
  const clearRunning = useTimerStore((s) => s.clearRunning)
  const updateEntry  = useUpdateEntry()
  const [idleStopped, setIdleStopped] = useState(false)
  const lastActivityRef = useRef(Date.now())
  const firedRef         = useRef(false)

  // Reset the activity clock whenever the running timer changes (fresh start,
  // or a page reload while a timer from a prior session is still running —
  // loading the page counts as "activity now" so the countdown restarts
  // rather than firing instantly).
  useEffect(() => {
    lastActivityRef.current = Date.now()
    firedRef.current = false
  }, [running?.id])

  // Track activity only while a timer is running.
  useEffect(() => {
    if (!running) return
    const onActivity = () => { lastActivityRef.current = Date.now() }
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, onActivity, { passive: true }))
    return () => ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, onActivity))
  }, [running])

  // Poll for idleness while a timer is running.
  useEffect(() => {
    if (!running) return

    const check = () => {
      if (firedRef.current) return
      const idleFor = Date.now() - lastActivityRef.current
      if (idleFor < IDLE_MS) return

      firedRef.current = true // stop double-fire while the mutation is in flight
      const endTime = new Date(
        Math.max(lastActivityRef.current, new Date(running.start_time).getTime() + 1000)
      )

      updateEntry.mutate(
        { id: running.id, payload: { end_time: endTime.toISOString() } },
        {
          onSuccess: () => {
            clearRunning()
            qc.invalidateQueries({ queryKey: entryKeys.all })
            qc.invalidateQueries({ queryKey: entryKeys.running })
            setIdleStopped(true)
          },
          onError: () => { firedRef.current = false },
        }
      )
    }

    const id = setInterval(check, POLL_MS)
    return () => clearInterval(id)
  }, [running, updateEntry, clearRunning, qc])

  return { idleStopped, dismissIdleStopped: () => setIdleStopped(false) }
}
