/**
 * timerStore – lightweight Zustand store that tracks the currently running
 * time entry in memory, giving instant UI feedback without waiting for a
 * network round-trip.
 */
import { create } from 'zustand'
import type { Database } from '@/types/database.types'

type RunningEntry = Database['public']['Tables']['time_entries']['Row'] & {
  project?: unknown
}

interface TimerState {
  running:      RunningEntry | null
  elapsedMs:    number
  /** Call when a new timer starts (from server response). */
  setRunning:   (entry: RunningEntry) => void
  /** Call on stop – immediately clears local state. */
  clearRunning: () => void
  /** Internal tick called every second by the interval. */
  tick:         () => void
}

export const useTimerStore = create<TimerState>((set, get) => ({
  running:   null,
  elapsedMs: 0,

  setRunning: (entry) => {
    const elapsed = Date.now() - new Date(entry.start_time).getTime()
    set({ running: entry, elapsedMs: elapsed })
  },

  clearRunning: () => set({ running: null, elapsedMs: 0 }),

  tick: () => {
    const { running } = get()
    if (!running) return
    const elapsed = Date.now() - new Date(running.start_time).getTime()
    set({ elapsedMs: elapsed })
  },
}))

// ─── Global tick interval (singleton) ────────────────────────
// Starts once in the module scope so a single interval drives all subscribers.
if (typeof window !== 'undefined') {
  setInterval(() => {
    useTimerStore.getState().tick()
  }, 1_000)
}
