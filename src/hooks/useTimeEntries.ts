import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTimeEntries,
  getRunningEntry,
  startTimer,
  stopTimer,
  createManualEntry,
  updateEntry,
  deleteEntry,
} from '@/services/timeEntries'
import { useTimerStore } from '@/store/timerStore'
import type { Database } from '@/types/database.types'

type TimeEntryInsert = Database['public']['Tables']['time_entries']['Insert']
type TimeEntryUpdate = Database['public']['Tables']['time_entries']['Update']

type TimeEntriesOpts = {
  projectId?: string
  from?: string
  to?: string
  limit?: number
}

export const entryKeys = {
  all:         ['time_entries'] as const,
  running:     ['time_entries', 'running'] as const,
  /** Cache key that includes every param the query is actually filtered by, so
   *  differently-scoped lists (e.g. a date range vs. a recent-N list) never collide. */
  list:        (opts?: TimeEntriesOpts) =>
    ['time_entries', 'list', opts?.projectId ?? null, opts?.from ?? null, opts?.to ?? null, opts?.limit ?? null] as const,
}

export const useTimeEntries = (opts?: TimeEntriesOpts) =>
  useQuery({
    queryKey: entryKeys.list(opts),
    queryFn: () => getTimeEntries(opts),
  })

export const useRunningEntry = () =>
  useQuery({
    queryKey: entryKeys.running,
    queryFn:  getRunningEntry,
    refetchInterval: 10_000, // poll every 10 s as safety net
  })

export const useStartTimer = () => {
  const qc = useQueryClient()
  const setRunning = useTimerStore((s) => s.setRunning)

  return useMutation({
    mutationFn: ({ projectId, description }: { projectId: string; description?: string }) =>
      startTimer(projectId, description),
    onSuccess: (entry) => {
      setRunning(entry)
      qc.invalidateQueries({ queryKey: entryKeys.running })
      qc.invalidateQueries({ queryKey: entryKeys.all })
    },
  })
}

export const useStopTimer = () => {
  const qc = useQueryClient()
  const clearRunning = useTimerStore((s) => s.clearRunning)

  return useMutation({
    mutationFn: (id: string) => stopTimer(id),
    onMutate: () => {
      // Instant UI feedback – clear local state immediately
      clearRunning()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: entryKeys.running })
      qc.invalidateQueries({ queryKey: entryKeys.all })
    },
    onError: () => {
      // Restore running entry on error (best-effort — if this also fails, the
      // periodic useRunningEntry poll will eventually reconcile local state)
      getRunningEntry()
        .then((entry) => {
          if (entry) useTimerStore.getState().setRunning(entry)
        })
        .catch(console.error)
    },
  })
}

export const useCreateManualEntry = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: TimeEntryInsert) => createManualEntry(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: entryKeys.all }) },
  })
}

export const useUpdateEntry = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TimeEntryUpdate }) =>
      updateEntry(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: entryKeys.all }) },
  })
}

export const useDeleteEntry = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEntry(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: entryKeys.all }) },
  })
}
