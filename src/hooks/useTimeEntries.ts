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

export const entryKeys = {
  all:         ['time_entries'] as const,
  running:     ['time_entries', 'running'] as const,
  byProject:   (projectId: string) => ['time_entries', 'project', projectId] as const,
  range:       (from: string, to: string) => ['time_entries', 'range', from, to] as const,
}

export const useTimeEntries = (opts?: {
  projectId?: string
  from?: string
  to?: string
  limit?: number
}) =>
  useQuery({
    queryKey: opts?.projectId
      ? entryKeys.byProject(opts.projectId)
      : entryKeys.all,
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
    onError: (_, id) => {
      // Restore running entry on error
      getRunningEntry().then((entry) => {
        if (entry) useTimerStore.getState().setRunning(entry)
      })
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
