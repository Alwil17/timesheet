'use client'

/**
 * Subscribes to Supabase Realtime changes on the time_entries table and keeps
 * the React Query cache in sync. Mount this once near the root of the app.
 */
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { entryKeys } from '@/hooks/useTimeEntries'
import { useTimerStore } from '@/store/timerStore'

export function RealtimeSync() {
  const qc          = useQueryClient()
  const setRunning  = useTimerStore((s) => s.setRunning)
  const clearRunning = useTimerStore((s) => s.clearRunning)

  useEffect(() => {
    const channel = supabase
      .channel('time_entries_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'time_entries' },
        (payload) => {
          // Refresh queries so lists stay up to date
          qc.invalidateQueries({ queryKey: entryKeys.all })
          qc.invalidateQueries({ queryKey: entryKeys.running })

          // If a row was closed (end_time set) and it matches local running entry, clear it
          if (payload.eventType === 'UPDATE') {
            const row = payload.new as { id: string; end_time: string | null }
            const running = useTimerStore.getState().running
            if (running && running.id === row.id && row.end_time) {
              clearRunning()
            }
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [qc, setRunning, clearRunning])

  return null
}
